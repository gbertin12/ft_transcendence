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

// Map of user id to channel id
export let usersChannels: Record<number, number> = {};

@WebSocketGateway(8001, { cors: '*' })
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server;
    
    afterInit(server: any) {
        console.log('Init');
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        console.log('Client connected');
    }
    
    handleDisconnect(client: Socket) {
    }

    @SubscribeMessage('join') // Message received from client
    handleJoin(client: Socket, payload: any) {
        usersChannels[client.id] = payload.channel;
    }
}

export default ChatGateway;