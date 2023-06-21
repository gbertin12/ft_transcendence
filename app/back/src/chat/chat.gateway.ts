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
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DmsService } from '../dms/dms.service';

export let systemMessageStack: number = -1; // Decremented each time a system message is sent to avoid message id conflicts

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
        private dmsService: DmsService,
    ) { }

    // Map of user id -> socket client
    usersClients: Record<number, Socket> = {};

    @WebSocketServer()
    server;

    afterInit(server: any) {
        //console.log('Init');
    }

    async sendSystemMessage(channelId: number, message: string) {
        this.server.to(`channel-${channelId}`).emit('message', {
            // custom system message
            content: message,
            message_id: systemMessageStack--,
            sender: { avatar: null, id: -1, username: "System", },
            timestamp: new Date(),
        });
    }

    async handleConnection(client: Socket) {
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
            this.usersClients[user.id] = client;
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
            delete this.usersClients[user.id];
            client['friends'].forEach((id: number) => {
                if (this.usersClients[id]) {
                    this.usersClients[id].emit('offline', user.id);
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
        // Check if user is allowed to join channel or is banned
        const channel = await this.channelService.getChannel(channelId);
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if (await this.punishmentsService.hasActiveBan(client['user'].id, channelId)) {
            throw new ForbiddenException('You are banned from this channel');
        }
        if (channel.private && !await this.channelService.isUserInChannel(client['user'].id, channelId)) {
            throw new ForbiddenException('You are not allowed to join this channel');
        }
        await client.join(`channel-${channelId}`);
        let staff: ChannelStaff = await this.channelService.getChannelStaff(channelId);
        client.emit('staff', staff);
        let mute: Punishment | null = await this.punishmentsService.hasActiveMute(client['user'].id, channelId);
        if (mute) {
            client.emit('punishment', {
                type: 'muted',
                duration: Math.floor((new Date(mute.expires_at).getTime() - new Date().getTime()) / 1000),
            });
        }
    }

    @SubscribeMessage('leave')
    async handleLeave(client: Socket, channelId: number) {
        // leave all channels except first one
        Object.keys(client.rooms).forEach((room) => {
            if (room !== client.id && room.startsWith("channel-")) {
                console.log("leaving room:", room)
                client.leave(room);
            }
        });
    }

    @SubscribeMessage('dmDelete')
    async handleDmDelete(client: Socket, payload: { interlocutor: number, message_id: number }) {
        const message = await this.dmsService.getMessage(payload.message_id);
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        if (message.sender_id !== client['user'].id) {
            throw new ForbiddenException('You are not allowed to delete this message');
        }
        await this.dmsService.deleteMessage(payload.message_id);
        if (this.usersClients[payload.interlocutor]) {
            this.usersClients[payload.interlocutor].emit('messageDeleted', payload.message_id);
        }
        client.emit('messageDeleted', payload.message_id);
    }

    @SubscribeMessage('updateStatus')
    async handleUpdateStatus(client: Socket, payload: any) {
        // loop through all user's friends and send the message to the right user
        const friends = client['friends'];
        friends.forEach((id: number) => {
            if (this.usersClients[id]) {
                switch (payload.status) { // do not allow arbitrary status values
                    case 'online':
                        this.usersClients[id].emit('online', client['user'].id);
                        break;
                    case 'typing':
                        this.usersClients[id].emit('typing', client['user'].id);
                        break;
                    case 'playing':
                        this.usersClients[id].emit('playing', client['user'].id);
                        break;
                    case 'offline':
                        this.usersClients[id].emit('offline', client['user'].id);
                        break;
                    default:
                        break; // do nothing
                }
            }
        });
    }

    @SubscribeMessage('onlineAnswer') // Pretty much a ping-pong, send a `online` message to the user with the id `payload.id` (doesn't work)
    async handleOnlineAnswer(client: Socket, pong_id: number) {
        if (this.usersClients[pong_id]) {
            this.usersClients[pong_id].emit('onlineAnswer', client['user'].id);
        }
    }
}

export default ChatGateway;
