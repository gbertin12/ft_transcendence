import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { handleColisionWithObstacle,  } from './obstacles';
import { handleNewPower, handleColisionWithPower } from './power';
import { UserService } from '../../src/user/user.service';
import { PlayerInterface, roomInterface, obstaclesInterface, powerAvailables } from '../../src/interfaces/pong.interface';

// set playground value
const canvasHeight = 300;
const canvasWidth = 500;
const playerHeight = canvasHeight / 4;
const radiusBall = 10;
const spaceBetweenPlayerAndWall = canvasWidth * 0.05;

const convertToPercent = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
};

export const convertToPixel = (value: number, maxValue: number) => {
    return (value * maxValue) / 100;
};

const udpdateBallSpeedX = (speedX: number) => {
    let newSpeed = speedX;
    if (speedX > 0 && speedX < 1.5) newSpeed = speedX + 0.1;
    else if (speedX < 0 && speedX > -1.5) newSpeed = speedX - 0.1;
    return newSpeed;
};

const updateBallSpeedY = (room: roomInterface, player: number) => {
    let newSpeed = room.pongState.ball.speedY;
    if (player === 1) 
    {
        const percent = (room.pongState.ball.y - convertToPixel(room.pongState.player1.y, canvasHeight)) /
            (convertToPixel(room.pongState.player1.y, canvasHeight) + playerHeight - convertToPixel(room.pongState.player1.y, canvasHeight));
        newSpeed = percent;
    } 
    else 
    {
        const percent = (room.pongState.ball.y - convertToPixel(room.pongState.player2.y, canvasHeight)) /
            (convertToPixel(room.pongState.player2.y, canvasHeight) + playerHeight - convertToPixel(room.pongState.player2.y, canvasHeight));
        newSpeed = percent;
    }
    return newSpeed;
};



const sendBallPosition = (room: roomInterface, server: Server) => {
    const x = convertToPercent(room.pongState.ball.x, canvasWidth);
    const y = convertToPercent(room.pongState.ball.y, canvasHeight);
    server.to(room.pongState.player1.id).emit('updateBall', {
        x: x,
        y: y,
    });
    server.to(room.pongState.player2.id).emit('updateBall', {
        x: 100 - x,
        y: 100 - y,
    });
};

const handleCheckCollision = (room: roomInterface) => {
    // check collision with player 1
    if (room.pongState.ball.x - radiusBall <= spaceBetweenPlayerAndWall &&
        room.pongState.ball.y >= convertToPixel(75 - room.pongState.player1.y, canvasHeight) &&
        room.pongState.ball.y <= convertToPixel(75 - room.pongState.player1.y, canvasHeight) + playerHeight
    ) 
    {
        if (room.pongState.ball.speedX < 0) 
        {
            room.pongState.ball.speedX = -room.pongState.ball.speedX;
            room.pongState.ball.speedX = udpdateBallSpeedX(
                room.pongState.ball.speedX,
            );
            room.pongState.ball.x -= 5;
            room.pongState.ball.speedY = updateBallSpeedY(room, 1);
        }
    }
    // check collision with player 2
    if (room.pongState.ball.x + radiusBall >= canvasWidth - spaceBetweenPlayerAndWall &&
        room.pongState.ball.y + radiusBall >= convertToPixel(room.pongState.player2.y, canvasHeight) &&
        room.pongState.ball.y + radiusBall <= convertToPixel(room.pongState.player2.y, canvasHeight) + playerHeight
    ) 
    {
        if (room.pongState.ball.speedX > 0) 
        {
            room.pongState.ball.speedX = -room.pongState.ball.speedX;
            room.pongState.ball.speedX = udpdateBallSpeedX(
                room.pongState.ball.speedX,
            );
            room.pongState.ball.x += 5;
        }
        room.pongState.ball.speedY = updateBallSpeedY(room, 2);
    }
    // check collision with top and bottom
    if (room.pongState.ball.y <= radiusBall || room.pongState.ball.y >= canvasHeight - radiusBall) 
    {
        room.pongState.ball.speedY = -room.pongState.ball.speedY;
        room.pongState.ball.speedX = udpdateBallSpeedX(
            room.pongState.ball.speedX,
        );
    }
}

const sendScore = (room: roomInterface, server: Server) => {
    server.to(room.pongState.player1.id).emit('updateScore', {
        scorePlayer1: room.pongState.player1.score,
        scorePlayer2: room.pongState.player2.score,
    });
    server.to(room.pongState.player2.id).emit('updateScore', {
        scorePlayer1: room.pongState.player2.score,
        scorePlayer2: room.pongState.player1.score,
    });
};

const initPosition = (
    room: roomInterface, 
    server: Server, 
    obstacles: obstaclesInterface[],
    powerAvailables: powerAvailables[]) => {
    // set players && ball on server side 
    room.pongState.ball.x = convertToPixel(50, canvasWidth);
    room.pongState.ball.y = convertToPixel(50, canvasHeight);
    room.pongState.player1.y = 38.5;
    room.pongState.player2.y = 38.5;
    // send players position to client side
    server.to(room.pongState.player1.id).emit('resetPlayers', {percentP1: 38.5, percentP2: 38.5});
    server.to(room.pongState.player2.id).emit('resetPlayers', {percentP1: 38.5, percentP2: 38.5});
}

const handleResetPlayerPosition = (
    room: roomInterface, 
    server: Server, 
    obstacles: obstaclesInterface[],
    powerAvailables: powerAvailables[]) => {
    // check who lose round
    if (room.pongState.ball.x <= radiusBall) 
    {
        room.pongState.player2.score++;
        room.pongState.ball.speedX = 1;
        room.pongState.ball.speedY = 0.8;
    } 
    else 
    {
        room.pongState.player1.score++;
        room.pongState.ball.speedX = -1;
        room.pongState.ball.speedY = -0.8;
    }
    initPosition(room, server, obstacles,powerAvailables);
    sendScore(room, server);
}

@Injectable()
export class GameService {
    constructor(
        private userService: UserService,
    ) { }

    handleGame(room: roomInterface, server: Server) {
        // set ball position
        room.pongState.ball.x = convertToPixel(50, canvasWidth);
        room.pongState.ball.y = convertToPixel(50, canvasHeight);
        room.pongState.player1.y = canvasHeight / 3;
        room.pongState.player2.y = canvasHeight / 3;
        let timeToNewPower = 0;
        let idPower = 0;
        let initPlayer = true;
        const obstacles: obstaclesInterface[] = [];
        const powersAvailables: powerAvailables[] = [
            { id: 0, isActive: false, type: -1, x: 66, y:33 },
            { id: 1, isActive: false, type: -1, x: 33, y:66 },
            { id: 2, isActive: false, type: -1, x: 50, y:50 },
            { id: 3, isActive: false, type: -1, x: 75, y:25 },
            { id: 4, isActive: false, type: -1, x: 75, y:50 },
            { id: 5, isActive: false, type: -1, x: 80, y:80 },
        ]

        const interval = setInterval(() => {
            if (initPlayer && room.pongState.player1.score == 0 && room.pongState.player2.score == 0) {
                initPlayer = false;
                initPosition(room, server, obstacles, powersAvailables);
            }
            // check if game is finished
            if (room.pongState.player1.score == 10 || room.pongState.player2.score == 10) {
                clearInterval(interval);
                this.handleEndGame(room, server);
                return;
            }
            if (room.pongState.modes)
            {
                timeToNewPower += 1;
                // return 1 if a new power was create
                handleNewPower(room, server, timeToNewPower, powersAvailables, obstacles);
                if (timeToNewPower === 100) 
                timeToNewPower = 0;
                handleColisionWithPower(room, server, obstacles, powersAvailables);
                handleColisionWithObstacle(room, obstacles);
            }
            // update ball position
            room.pongState.ball.x = room.pongState.ball.x + convertToPixel(room.pongState.ball.speedX, canvasWidth);
            room.pongState.ball.y = room.pongState.ball.y + convertToPixel(room.pongState.ball.speedY, canvasHeight);
            // send ball position
            sendBallPosition(room, server);
            // check collision with players && walls
            handleCheckCollision(room);
            // check if someone loose the round
            if (room.pongState.ball.x <= radiusBall || room.pongState.ball.x >= canvasWidth - radiusBall)
            handleResetPlayerPosition(room, server, obstacles, powersAvailables);
        }, 40);
    }

    async handleEndGame(room: roomInterface, server: Server) {
        const player1 = room.pongState.player1;
        const player2 = room.pongState.player2;
        const win = { win: true, score1: player1.score, score2: player2.score };
        const loose = { win: false, score1: player1.score, score2: player2.score };

        if (player1.score > player2.score) {
            server.to(player1.id).emit('endGame', win);
            server.to(player2.id).emit('endGame', loose);

            await this.processEndGame(player1, player2);
        } else {
            server.to(player2.id).emit('endGame', win);
            server.to(player1.id).emit('endGame', loose);

            this.processEndGame(player2, player1);
        }
    }

    async processEndGame(winner: PlayerInterface, looser: PlayerInterface) {
        await this.userService.incrementWin(winner.name);
        await this.userService.incrementLoose(looser.name);

        const [ eloWinner, eloLooser ] = await this.calcElo(winner, looser);
        await this.userService.updateElo(winner.name, eloWinner);
        await this.userService.updateElo(looser.name, eloLooser);

        await this.userService.addGame(
            winner.userId,
            winner.score,
            looser.userId,
            looser.score,
            Math.abs(eloWinner - eloLooser),
            eloWinner,
            eloLooser
        );
    }

    async calcElo(winner: PlayerInterface, looser: PlayerInterface): Promise<number[]> {
        const user1 = await this.userService.getUserByName(winner.name);
        const user2 = await this.userService.getUserByName(looser.name);
        let eloWinner = user1.elo;
        let eloLooser = user2.elo;
        const p1 = eloWinner / (eloWinner + eloLooser);
        const p2 = eloLooser / (eloWinner + eloLooser);
        const k = 42 * (winner.score - looser.score);
        console.log(`K = ${k}`);

        eloWinner = eloWinner + k * (1 - p1);
        eloLooser = eloLooser + k * (0 - p2);

        // prevent elo from reaching 0 or less
        if (eloLooser <= 0) eloLooser = 1;

        return [ Math.round(eloWinner), Math.round(eloLooser) ];
    }
}
