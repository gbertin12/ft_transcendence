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
import { Message } from '../interfaces/chat.interfaces';
import * as cookie from 'cookie';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { FriendsService } from '../friends/friends.service';

// Map of user id to channel id
// Used to send socket messages to all users watching a channel
export let usersChannels: Record<number, number> = {};

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
    ) { }

    @WebSocketServer()
    server;
    
    afterInit(server: any) {
        console.log('Init');
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
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }

    @SubscribeMessage('join') // Message received from client
    handleJoin(client: Socket, payload: any) {
        usersChannels[client.id] = payload.channel;
    }
}

export default ChatGateway;