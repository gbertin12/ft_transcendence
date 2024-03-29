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
export let userStatuses: Map<number, string> = new Map(); // Stores user statuses

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
            this.friendService.getFriends(user.id).then((friends) => {
                client['friends'] = friends.map((friend) => (friend.user_id === user.id ? friend.friend_id : friend.user_id));
            });
            client.join(`user-${user.id}`);
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
            client.leave(`user-${user.id}`);
            this.publishStatus(user.id, "offline");
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }

    @SubscribeMessage('join')
    async handleJoin(client: Socket, channelId: number) {
        // leave all channels that contains 'channel-'
        client.rooms.forEach((room) => {
            if (room.startsWith("channel-")) {
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
        if (channel.private && !await this.channelService.isUserInChannel(channelId, client['user'].id)) {
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
        client.leave(`channel-${channelId}`);
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
        this.server.to(`user-${client['user'].id}`).emit('messageDeleted', payload.message_id);
        this.server.to(`user-${payload.interlocutor}`).emit('messageDeleted', payload.message_id);
    }

    async publishStatus(user_id: number, status: string) {
        userStatuses[user_id] = status;
        // loop through all user's friends and send the message to the right user
        let friends = await this.friendService.getFriends(user_id);
        if (status === "online") {
            friends.forEach((friend) => {
                const id = friend.friend_id === user_id ? friend.user_id : friend.friend_id;
                if (userStatuses.hasOwnProperty(id)) {
                    this.server.to(`user-${user_id}`).emit(userStatuses[id], id);
                }
            });
        }
        if (userStatuses.hasOwnProperty(user_id) && status === "offline") {
            // Look if there are more than 1 connection in room `user-${user_id}`
            if (this.server.sockets.adapter.rooms.has(`user-${user_id}`)) {
                return ;
            }
        }
        friends.forEach((friend) => {
            const id = friend.friend_id === user_id ? friend.user_id : friend.friend_id;
            switch (status) { // do not allow arbitrary status values
                case 'online':
                    this.server.to(`user-${id}`).emit('online', user_id);
                    break;
                case 'typing':
                    this.server.to(`user-${id}`).emit('typing', user_id);
                    break;
                case 'playing':
                    this.server.to(`user-${id}`).emit('playing', user_id);
                    break;
                case 'offline':
                    this.server.to(`user-${id}`).emit('offline', user_id);
                    break;
                default:
                    break; // do nothing
            }
        });
    }
}

export default ChatGateway;
