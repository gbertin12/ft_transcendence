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

// Map of user id to channel id
export let usersChannels: Record<number, number> = {};

// Map of user per socket id
export let users: Record<number, Socket> = {};

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
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }
    
    handleDisconnect(client: Socket) {
    }

    @SubscribeMessage('join') // Message received from client
    handleJoin(client: Socket, payload: any) {
        usersChannels[client.id] = payload.channel;
    }
}

export default ChatGateway;