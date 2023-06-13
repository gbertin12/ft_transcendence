import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { roomInterface, PlayerInterface } from '../../src/interfaces/pong.interface';
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
    async handleConnection(client: Socket) 
    {
        // verify user with 'session' cookie
        const cookies = cookie.parse(client.handshake.headers.cookie || '');
        if (!cookies || !cookies.hasOwnProperty('session')) {
            console.log('NO SESSION FOUND');
            //client.disconnect();
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
            };
            this.players.push(player);
            // console.log('players', this.players);
            // send the player id to the client
            client.emit('playerId', client.id);
        } catch {
            client.disconnect();
            return "UnauthorizedException";
        }
    }

    // remove player from the players array
    handleDisconnect(client: Socket) 
    {
        // Retirer le joueur de la liste des joueurs actifs
        const playerIndex = this.players.findIndex(
            (player) => player.id === client.id,
        );
        if (playerIndex !== -1) {
            this.players.splice(playerIndex, 1);
        }
    }

    @SubscribeMessage('searchGame')
    searchGame(@MessageBody() data: {clientId: string, modes: boolean}) 
    {
        const playerId = data.clientId;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 1;
            player.modes = data.modes;
        }
        const waitingPlayer = this.players.find(
            (player) => player.state === 1 && player.id !== playerId && player.modes === data.modes,
        );
        if (waitingPlayer && player) {
            player.state = 2;
            waitingPlayer.state = 2;
            const newRoom: roomInterface = {
                name: 'room' + this.rooms.length,
                state: 0,
                pongState: {
                    ball: {
                        x: 0,
                        y: 0,
                        speedX: 0.6,
                        speedY: 0.4,
                    },
                    player1: waitingPlayer,
                    player2: player,
                    modes: data.modes
                },
            };
            this.rooms.push(newRoom);
            this.server.to(playerId).emit('searchGame', newRoom.name);
            this.server.to(waitingPlayer.id).emit('searchGame', newRoom.name);
            this.gameService.handleGame(newRoom, this.server);
        }
        console.log(this.rooms);
    }

    @SubscribeMessage('playerMove')
    playerMove(@MessageBody() data: { percent: number; clientId: string; room: string }) 
    {
        const room = this.rooms.find((room) => room.name === data.room);
        if (room) 
        {
            if (room.pongState.player1.id === data.clientId) 
            {
                const percent = 75 - data.percent;
                room.pongState.player2.y = percent;
                room.pongState.player1.y = percent;
                this.server.to(room.pongState.player2.id).emit('playerMove', percent);
            } 
            else if (room.pongState.player2.id === data.clientId) 
            {
                const percent = 75 - data.percent;
                room.pongState.player2.y = percent;
                this.server.to(room.pongState.player1.id).emit('playerMove', percent);
            }
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@MessageBody() data: {clientId: string}) 
    {
        const playerId = data.clientId;
        const player = this.players.find((player) => player.id === playerId);
        if (player) {
            player.state = 0;
        }
        this.server.to(playerId).emit('cancelGame');
    }

    @SubscribeMessage('startGame')
    handleMessage(@MessageBody() clientId: string): void 
    {
        console.log(clientId);
        this.server.emit('startGame', clientId);
    }
}
