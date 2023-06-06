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
import { ChannelStaff, Message } from '../interfaces/chat.interfaces';
import * as cookie from 'cookie';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { FriendsService } from '../friends/friends.service';
import { ChannelService } from '../channel/channel.service';

// Map of user id to channel id
// Used to send socket messages to all users watching a channel
export let usersChannels: Record<number, number> = {};

// Map of user id -> socket client
export let usersClients: Record<number, Socket> = {};

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
    ) { }

    @WebSocketServer()
    server;
    
    afterInit(server: any) {
        console.log('Init');
    }PongModule
    
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
        usersChannels[client.id] = channelId;
        client.join(`channel-${channelId}`); // TODO: use socket.io channels

        // TODO: get all staff instead of just the owner
        let staff: ChannelStaff = await this.channelService.getChannelStaff(channelId);
        // answer with ownerId
        client.emit('staff', staff);
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