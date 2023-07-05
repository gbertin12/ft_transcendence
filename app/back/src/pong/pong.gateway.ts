import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
    roomInterface,
    PlayerInterface,
    PlayerEndGame,
} from '../../src/interfaces/pong.interface';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as cookie from 'cookie';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway(8001, {
    cors: {
        origin: process.env.FRONT_URL,
        credentials: true,
    },
})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private gameService: GameService,
    ) {}

    players: PlayerInterface[] = [];
    rooms: roomInterface[] = [];
    duelRequests = {};

    @WebSocketServer()
    server: Server;

    // when a client connects, we add it to the connectedUsers array
    async handleConnection(client: Socket) {
        // verify user with 'session' cookie
        const cookies = cookie.parse(client.handshake.headers.cookie || '');
        if (!cookies || !cookies.hasOwnProperty('session')) {
            client.emit('unauthorized', '/auth');
            return 'UnauthorizedException';
        }
        try {
            const payload = await this.jwtService.verifyAsync(cookies.session);
            const user = await this.userService.getUserById(payload.id);
            client['user'] = user;
            // player state : 0 = not in game, 1 = searching for game, 2 = in game, 3 = watching game
            const player: PlayerInterface = {
                id: client.id,
                userId: user.id,
                name: user.name,
                state: 0,
                y: 0,
                score: 0,
                modes: true,
                userInfos: user,
            };
            this.players.push(player);
            //console.log('players', this.players);
            // send the player id to the client
            client.emit('playerId', client.id);
        } catch {
            client.disconnect();
            return 'UnauthorizedException';
        }
    }

    // remove player from the players array
    handleDisconnect(client: Socket) {
        // Retirer le joueur de la liste des joueurs actifs
        const leaver = this.players.find(
            (player) => player.id === client.id && player.state === 2,
        );
        // if player disconnects while in game
        if (leaver) {
            const room = this.rooms.find(
                (room) =>
                    leaver.id === room.pongState.player1.id ||
                        leaver.id === room.pongState.player2.id,
            );

            if (room.state === 1) {
                this.bustLeaver(client, room.name);
            }
        }
    }

    @SubscribeMessage('searchGame')
    searchGame(@MessageBody() data: { clientId: string; modes: boolean }) {
        const playerId = data.clientId;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 1;
            player.modes = data.modes;
        }
        const waitingPlayer = this.players.find(
            (player) =>
                player.state === 1 &&
                    player.id !== playerId &&
                    player.modes === data.modes,
        );
        if (waitingPlayer && player && waitingPlayer.id != player.id) {
            player.state = 2;
            waitingPlayer.state = 2;
            const roomName: string = uuidv4();
            const newRoom: roomInterface = {
                name: roomName,
                state: 0,
                pongState: {
                    ball: {
                        x: 50,
                        y: 50,
                        speedX: 2,
                        speedY: 2,
                    },
                    player1: waitingPlayer,
                    player2: player,
                    modes: data.modes,
                },
            };

            this.rooms.push(newRoom);
            this.server.to(playerId).emit('searchGame', newRoom.name, 1);
            this.server.to(waitingPlayer.id).emit('searchGame', newRoom.name, 0);
            this.gameService.handleGame(newRoom, this.server, this.duelRequests);
        }
    }

    @SubscribeMessage('duelRequest')
    handleDuelRequest(client: Socket, opponentId: number) {
        if (this.duelRequests[client.id]) {
            // send something ?
            return ;
        }

        const initiator = this.players.find((player) => player.id === client.id);
        const opponent = this.players.find((player) => player.userId === opponentId);
        if (initiator.userId === opponent.userId ||  // can't play against yourself
            initiator.state !== 0 ||                 // check if initiator is in queue or game
            opponent.state !== 0                     // check if opponent is in queue or game
        ) {
            // send something?
            return ;
        }

        // check if player has already been requested in duel
        for (let key in this.duelRequests) {
            if (this.duelRequests[key] === initiator.id) {
                // send something?
                return ;
            }
        }

        console.log("DUEL REQUEST from", client.id, "to:", opponent.id);

        this.duelRequests[client.id] = opponentId;
        this.server.to(opponent.id).emit('duelRequest', initiator);
    }

    @SubscribeMessage('acceptDuel')
    acceptDuelRequest(client: Socket, opponent: PlayerInterface) {
        if (!this.duelRequests[opponent.id]) {
            return ;
        }

        const player = this.players.find((p) => client.id === p.id);
        if (player.userId === opponent.userId ||
            player.state !== 0 ||
            opponent.state !== 0
        ) {
            // send something?
            return ;
        }
        const roomName: string = uuidv4();
        const newRoom: roomInterface = {
            name: roomName,
            state: 1,
            pongState: {
                ball: {
                    x: 50,
                    y: 50,
                    speedX: 2,
                    speedY: 2,
                },
                player1: player,
                player2: opponent,
                modes: true
            },
        };

        player.state = 2;
        opponent.state = 2;
        const duelData = { roomname: roomName, who: 0 };
        this.rooms.push(newRoom);
        this.server.to(player.id).emit('searchGameDuel', duelData);
        duelData.who = 1;
        this.server.to(opponent.id).emit('searchGameDuel', duelData);
        this.gameService.handleGame(newRoom, this.server, this.duelRequests);
    }

    @SubscribeMessage('declineDuel')
    declineDuelRequest(client: Socket, opponent: PlayerInterface) {
        if (!this.duelRequests[opponent.id]) {
            return ;
        }

        delete this.duelRequests[opponent.id];
        const player = this.players.find((p) => client.id === p.id);
        this.server.to(opponent.id).emit('declineDuelRequest', player);
    }

    @SubscribeMessage('playerMove')
    playerMove(
        @MessageBody() data: { percent: number; clientId: string; room: string },
    ) {
        const room = this.rooms.find((room) => room.name === data.room);
        if (room) {
            if (room.pongState.player1.id === data.clientId) {
                const percent = data.percent;
                room.pongState.player1.y = percent;
                this.server.to(room.name).emit('playerMove', {
                    player: 0,
                    percent: percent,
                });
            } else if (room.pongState.player2.id === data.clientId) {
                const percent = data.percent;
                room.pongState.player2.y = percent;
                this.server.to(room.name).emit('playerMove', {
                    player: 1,
                    percent: percent,
                });
            }
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(client: Socket) {
        const playerId = client.id;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 0;
        }
        this.server.to(playerId).emit('cancelGame');
        console.log("CANCLED GASME");
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, roomName: string): void {
        client.join(roomName);
        console.log('joinRoom', client.id);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, roomName: string): void {
        client.leave(roomName);
        console.log('leaveRoom', client.id);
    }

    bustLeaver(client: Socket, roomName: string) {
        const room = this.rooms.find((room) => room.name === roomName);

        if (room) {
            if (room.pongState.player1.id === client.id) {
                room.pongState.player1.score = 0;
                room.pongState.player2.score = 5;
            } else {
                room.pongState.player1.score = 5;
                room.pongState.player2.score = 0;
            }

            room.state = 2;
            this.gameService.handleEndGame(room, this.server, true, this.duelRequests);
        }
    }

    @SubscribeMessage('leaveGame')
    handleLeaveGame(client: Socket, roomName: string) {
        client.leave(roomName);
        this.bustLeaver(client, roomName);
    }
}
