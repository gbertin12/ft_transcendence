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

// Map of user per sockets
// Used to send socket messages to a specific user
export let users: Record<number, Socket> = {};

// Map of user ids and friends ids
// Used to publish online/offline/playing status without leaking it to anyone whose not a friend
export let usersFriends: Record<number, number[]> = {}; // TODO: use a Set instead of an array

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
            users[user.id] = client;
            // only store friends id asynchronously to avoid blocking the connection
            this.friendService.getUserFriends(user).then(friends => {
                usersFriends[user.id] = friends.map(friend => friend.user_id === user.id ? friend.friend_id : friend.user_id);
                // send online status to friends if any
                if (friends.length > 0) {
                    for (const friend of friends) {
                        if (usersFriends.hasOwnProperty(friend.friend_id) && friend.friend_id !== user.id) {
                            users[friend.friend_id].emit('online', { user_id: user.id });
                        }
                    }
                }
                // for each friend the user has, check if they're in the users map, if so, send online status
                if (usersFriends.hasOwnProperty(user.id)) {
                    for (const friend of usersFriends[user.id]) {
                        if (users.hasOwnProperty(friend)) {
                            setTimeout(() => { // FIXME: this is a hack to avoid sending the online status before the client is ready to receive it
                                client.emit('online', { user_id: friend });
                            }, 1000);
                        }
                    }
                }
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
            // send offline status to friends if any
            if (usersFriends.hasOwnProperty(user.id)) {
                for (const friend of usersFriends[user.id]) {
                    if (usersFriends.hasOwnProperty(friend)) {
                        users[friend].emit('offline', { user_id: user.id });
                        usersFriends[friend] = usersFriends[friend].filter(f => f !== user.id);
                    }
                }
            }
            // clean up user from anywhere else
            delete users[user.id];
            delete usersChannels[client.id];
            delete usersFriends[user.id];
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