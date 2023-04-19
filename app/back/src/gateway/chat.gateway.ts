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
import { Message } from 'src/interfaces/chat.interfaces';

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
        console.log('Client disconnected');
    }
    
    @SubscribeMessage('message') // Message received from client
    handleMessage(client: Socket, payload: Message) {
        this.server.emit('message', payload);
    }
}

export default ChatGateway;