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

// Map of user id to channel id
let usersChannels: Record<number, number> = {};

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
        delete usersChannels[client.id];
    }
    
    @SubscribeMessage('message') // Message received from client
    handleMessage(client: Socket, payload: any) {
        // this.server.emit('message', payload);
        // send message to all users in the same channel
        const channelId = payload.message.channel_id;
        for (const [id, channel] of Object.entries(usersChannels)) {
            console.log(`User ${id} is in channel ${channel} (wanted ${channelId})`);
            if (channel === channelId) {
                this.server.to(id).emit('message', payload);
            }
        }
    }

    @SubscribeMessage('join') // Message received from client
    handleJoin(client: Socket, payload: any) {
        usersChannels[client.id] = payload.channel;
    }
}

export default ChatGateway;