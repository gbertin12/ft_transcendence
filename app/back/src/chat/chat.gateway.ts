import {
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { ChannelStaff, MessageData, PowerActionData } from '../interfaces/chat.interfaces';
import * as cookie from 'cookie';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { FriendsService } from '../friends/friends.service';
import { ChannelService } from '../channel/channel.service';
import { Channel, Punishment } from '@prisma/client';
import { PunishmentsService } from '../punishments/punishments.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export let systemMessageStack: number = -1; // Decremented each time a system message is sent to avoid message id conflicts

// Map of user id -> socket client
export let usersClients: Record<number, Socket> = {};

function powerLevel(channel: ChannelStaff, user_id: number, messageData?: MessageData): number {
    if (channel.owner_id === user_id) {
        return 3;
    }
    if (channel.administrators.includes(user_id)) {
        return 2;
    }
    if (messageData && messageData.sender.id === user_id) {
        return 1;
    }
    return 0;
}

@WebSocketGateway(8001, {
    cors: {
        origin: process.env.FRONT_URL,
        credentials: true,
    },
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private friendService: FriendsService,
        private channelService: ChannelService,
        private punishmentsService: PunishmentsService,
    ) { }

    @WebSocketServer()
    server;
    
    afterInit(server: any) {
        //console.log('Init');
    }
    
    async handleConnection(client: Socket) 
    {
        // verify user with 'session' cookie
        const cookies = cookie.parse(client.handshake.headers.cookie || '');
        if (!cookies || !cookies.hasOwnProperty('session')) {
            client.disconnect();
            return "UnauthorizedException";
        }
        try {
            const payload = await this.jwtService.verifyAsync(cookies.session);
            const user = await this.userService.getUserById(payload.id);
            client['user'] = user;
            usersClients[user.id] = client;
            this.friendService.getFriends(user.id).then((friends) => {
                client['friends'] = friends.map((friend) => (friend.user_id === user.id ? friend.friend_id : friend.user_id));
            });
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }

    async handleDisconnect(client: Socket) {
        const cookies = cookie.parse(client.handshake.headers.cookie || '');
        if (!cookies || !cookies.hasOwnProperty('session')) {
            client.disconnect();
            return "UnauthorizedException";
        }
        try {
            const payload = await this.jwtService.verifyAsync(cookies.session);
            const user = await this.userService.getUserById(payload.id);
            delete usersClients[user.id];
            client['friends'].forEach((id: number) => {
                if (usersClients[id]) {
                    usersClients[id].emit('offline', user.id);
                }
            });
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }

    @SubscribeMessage('join')
    async handleJoin(client: Socket, channelId: number) {
        // leave all channels except first one
        Object.keys(client.rooms).forEach((room) => {
            if (room !== client.id) {
                //console.log("leaving room:", room)
                client.leave(room);
            }
        });
        await client.join(`channel-${channelId}`);
        let staff: ChannelStaff = await this.channelService.getChannelStaff(channelId);
        client.emit('staff', staff);
        let mute: Punishment | null = await this.punishmentsService.hasActiveMute(client['user'].id, channelId);
        if (mute) {
            client.emit('punishment', {
                punishment_type: 'muted',
                duration: Math.floor((new Date(mute.expires_at).getTime() - new Date().getTime()) / 1000),
            });
        }
    }

    @SubscribeMessage('powerAction')
    async handlePowerAction(client: Socket, payload: PowerActionData) {
        // Check if channel's owner_id is the user, or if the user's id is in ChannelAdmin
        let staff: ChannelStaff = await this.channelService.getChannelStaff(payload.channel);
        if (payload.action == "deleted") {
            let senderRole: number = powerLevel(staff, client['user'].id, payload.targetMessage);
            // user must be owner, admin or author of the message
            if (senderRole == 0) {
                throw new ForbiddenException("You are not allowed to delete this message");
            }
            // remove message from database
            try {
                await this.channelService.deleteMessage(payload.targetMessage.message_id);
                // emit a messageDeleted event to all clients in the channel
                this.server.to(`channel-${payload.channel}`).emit('messageDeleted', payload.targetMessage);
            } catch (e) {
                throw new BadRequestException('Failed to delete message');
            } finally {
                return ;
            }
        }
        let senderRole: number = powerLevel(staff, client['user'].id);
        let targetRole: number = powerLevel(staff, payload.targetSender.id, payload.targetMessage);
        if (senderRole == 0 || senderRole < targetRole) { // TODO: Check permissions for ban, mute, kick and delete, not blocking
            throw new ForbiddenException("You are not allowed to perform this action");
        }
        // TODO: implement and check if user is staff in the channel, otherwise ignore
        let systemPayload = {
            // custom system message
            content: client['user'].name + ` ${payload.action} ` + `${payload.targetSender.name}`,
            message_id: systemMessageStack--,
            sender: { avatar: null, id: -1, username: "System", },
            timestamp: new Date(),
        };
        // insert punishment in database (TODO: treat durations)
        let punishment: any = await this.punishmentsService.applyPunishment(
            payload.targetSender.id,
            client['user'].id,
            payload.channel,
            -1, // payload.duration || -1,
            payload.action,
        );

        if (!punishment) {
            throw new Error('Failed to apply punishment');
        }

        this.server.to(`channel-${payload.channel}`).emit('message', systemPayload);
        // send punishment to the target user        // TODO: Fallback if user is not connected
        if (usersClients[payload.targetSender.id]) { // TODO: Implement duration
            usersClients[payload.targetSender.id].emit('punishment', {
                punishment_type: payload.action,
                channel_id: payload.channel,
                // duration: 3, // no duration is permanent
            });
        }
    }

    @SubscribeMessage('updateStatus')
    async handleUpdateStatus(client: Socket, payload: any) {
        // loop through all user's friends and send the message to the right user
        const friends = client['friends'];
        friends.forEach((id: number) => {
            if (usersClients[id]) {
                switch (payload.status) { // do not allow arbitrary status values
                    case 'online':
                        usersClients[id].emit('online', client['user'].id);
                        break;
                    case 'typing':
                        usersClients[id].emit('typing', client['user'].id);
                        break;
                    case 'playing':
                        usersClients[id].emit('playing', client['user'].id);
                        break;
                    case 'offline':
                        usersClients[id].emit('offline', client['user'].id);
                        break;
                    default:
                        break; // do nothing
                }
            }
        });
    }

    @SubscribeMessage('onlineAnswer') // Pretty much a ping-pong, send a `online` message to the user with the id `payload.id` (doesn't work)
    async handleOnlineAnswer(client: Socket, pong_id: number) {
        if (usersClients[pong_id]) {
            usersClients[pong_id].emit('onlineAnswer', client['user'].id);
        }
    }
}

export default ChatGateway;
