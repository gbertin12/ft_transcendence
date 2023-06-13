import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { roomInterface, PlayerInterface, PlayerEndGame } from '../../src/interfaces/pong.interface';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../src/user/user.service';
import * as cookie from 'cookie';

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
    ) { }

    players: PlayerInterface[] = [];
    rooms: roomInterface[] = [];

    @WebSocketServer()
    server: Server;

    // when a client connects, we add it to the connectedUsers array
    async handleConnection(client: Socket) {
        // verify user with 'session' cookie
        const cookies = cookie.parse(client.handshake.headers.cookie || '');
        if (!cookies || !cookies.hasOwnProperty('session')) {
            client.emit('unauthorized', '/auth');
            return "UnauthorizedException";
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
            return "UnauthorizedException";
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
            const room = this.rooms.find((room) => leaver.id === room.pongState.player1.id || leaver.id === room.pongState.player2.id);

            console.log(`DISCONNECTED: ${leaver}`);

            this.bustLeaver(client, room.name);
        }
    }

    @SubscribeMessage('searchGame')
    searchGame(@MessageBody() data: { clientId: string, modes: boolean }) {
        const playerId = data.clientId;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 1;
            player.modes = data.modes;
        }
        const waitingPlayer = this.players.find(
            (player) => player.state === 1 && player.id !== playerId && player.modes === data.modes,
        );
        if (waitingPlayer && player && waitingPlayer.id != player.id) {
            player.state = 2;
            waitingPlayer.state = 2;
            const newRoom: roomInterface = {
                name: 'room' + this.rooms.length,
                state: 0,
                pongState: {
                    ball: {
                        x: 50,
                        y: 50,
                        speedX: 1,
                        speedY: 1,
                    },
                    player1: waitingPlayer,
                    player2: player,
                    modes: data.modes
                },
            };

            this.rooms.push(newRoom);
            this.server.to(playerId).emit('searchGame', newRoom.name, 1);
            this.server.to(waitingPlayer.id).emit('searchGame', newRoom.name, 0);
            this.gameService.handleGame(newRoom, this.server);
        }
    }

    @SubscribeMessage('playerMove')
    playerMove(@MessageBody() data: { percent: number; clientId: string; room: string }) {
        const room = this.rooms.find((room) => room.name === data.room);
        if (room) {
            if (room.pongState.player1.id === data.clientId) {
                const percent = data.percent;
                room.pongState.player1.y = percent;
                this.server.to(room.name).emit('playerMove', {
                    player: 1,
                    percent: percent,
                });
            }
            else if (room.pongState.player2.id === data.clientId) {
                const percent = data.percent;
                room.pongState.player2.y = percent;
                this.server.to(room.name).emit('playerMove', {
                    player: 2,
                    percent: percent,
                });
            }
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@MessageBody() data: { clientId: string }) {
        const playerId = data.clientId;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 0;
        }
        this.server.to(playerId).emit('cancelGame');
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, roomName: string): void {
        client.join(roomName);
        console.log("joinRoom", client.id);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, roomName: string): void {
        client.leave(roomName);
        console.log("leaveRoom", client.id);

    }


    bustLeaver(client: Socket, roomName: string) {
        const room = this.rooms.find((room) => room.name === roomName);

        if (room) {
            if (room.pongState.player1.id === client.id) {
                room.pongState.player1.score = 0;
                room.pongState.player2.score = 10;
            } else {
                room.pongState.player1.score = 10;
                room.pongState.player2.score = 0;
            }
            this.gameService.handleEndGame(room, this.server, true);
        }
    }

    @SubscribeMessage('leaveGame')
    handleLeaveGame(client: Socket, roomName: string) {
        this.bustLeaver(client, roomName);
    }
}
