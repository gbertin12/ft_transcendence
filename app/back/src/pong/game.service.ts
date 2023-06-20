/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { handleColisionWithObstacle, } from './obstacles';
import { handleNewPower, handleColisionWithPower } from './power';
import { UserService } from '../user/user.service';
import { PlayerInterface, roomInterface, obstaclesInterface, powerAvailables, PlayerEndGame } from '../interfaces/pong.interface';

// set playground value
const canvasHeight = 700;
const canvasWidth = 1000;
const playerHeight = canvasHeight / 8;
const radiusBall = canvasWidth * 0.02;
const playerWidth = canvasWidth / 80;

let frameCount : number = 0;

const convertToPercent = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
};

export const convertToPixel = (value: number, maxValue: number) => {
    return (value * maxValue) / 100;
};

const updateBallSpeedX = (speedX: number) => {
    let newSpeed = speedX;
    if (speedX > 0 && speedX < 3) newSpeed = speedX + 0.2;
    else if (speedX < 0 && speedX > -3) newSpeed = speedX - 0.2;
    return newSpeed;
};

const updateBallSpeedY = (room: roomInterface, player: number) => {
    let newSpeed = room.pongState.ball.speedY;
    if (player === 1) {
        const percent = (room.pongState.ball.y - convertToPixel(room.pongState.player1.y, canvasHeight)) /
            (convertToPixel(room.pongState.player1.y, canvasHeight) + playerHeight - convertToPixel(room.pongState.player1.y, canvasHeight));
        newSpeed = percent;
    }
    else {
        const percent = (room.pongState.ball.y - convertToPixel(room.pongState.player2.y, canvasHeight)) /
            (convertToPixel(room.pongState.player2.y, canvasHeight) + playerHeight - convertToPixel(room.pongState.player2.y, canvasHeight));
        newSpeed = percent;
    }
    return newSpeed;
};

export const sendBallVector = (room: roomInterface, server: Server) => {
    console.log("Update vector", room.pongState.ball.speedX, room.pongState.ball.speedY)
    console.log("frame", frameCount);
    const speedX = convertToPercent(room.pongState.ball.speedX, canvasWidth);
    const speedY = convertToPercent(room.pongState.ball.speedY, canvasHeight);
    server.to(room.name).emit('updateBallVector', {
        speedX: room.pongState.ball.speedX,
        speedY: room.pongState.ball.speedY,
    });
    sendBallPosition(room, server);
}; 

const sendBallPosition = (room: roomInterface, server: Server) => {
    const x = convertToPercent(room.pongState.ball.x, canvasWidth);
    const y = convertToPercent(room.pongState.ball.y, canvasHeight);
    server.to(room.name).emit('updateBallPosition', {
        x: x,
        y: y,
    });
};

const handleCheckCollision = (room: roomInterface, server: Server) => {
    // check collision with player 1
    if (room.pongState.ball.x - 20 <= playerWidth &&
        room.pongState.ball.y >= convertToPixel(room.pongState.player1.y, canvasHeight) &&
        room.pongState.ball.y <= convertToPixel(room.pongState.player1.y, canvasHeight) + playerHeight
    ) {
        if (room.pongState.ball.speedX < 0) {
            room.pongState.ball.speedX = -room.pongState.ball.speedX;
            room.pongState.ball.speedX = updateBallSpeedX(
                room.pongState.ball.speedX,
            );
            room.pongState.ball.x -= 5;
            room.pongState.ball.speedY = updateBallSpeedY(room, 1);
            sendBallVector(room, server);
        }
    }
    // check collision with player 2
    if (room.pongState.ball.x + 20 >= canvasWidth - playerWidth &&
        room.pongState.ball.y >= convertToPixel(room.pongState.player2.y, canvasHeight) &&
        room.pongState.ball.y <= convertToPixel(room.pongState.player2.y, canvasHeight) + playerHeight
    ) {
        if (room.pongState.ball.speedX > 0) {
            room.pongState.ball.speedX = -room.pongState.ball.speedX;
            room.pongState.ball.speedX = updateBallSpeedX(
                room.pongState.ball.speedX,
            );
            room.pongState.ball.x += 5;
        }
        room.pongState.ball.speedY = updateBallSpeedY(room, 2);
        sendBallVector(room, server);
    }
    // check collision with top and bottom
    if (room.pongState.ball.y <= 0 || room.pongState.ball.y >= canvasHeight - radiusBall) {
        room.pongState.ball.speedY = -room.pongState.ball.speedY;
        room.pongState.ball.speedX = updateBallSpeedX(room.pongState.ball.speedX);
        sendBallVector(room, server);
    }
}

const sendScore = (room: roomInterface, server: Server) => {
    server.to(room.name).emit('updateScore', {
        scorePlayer1: room.pongState.player1.score,
        scorePlayer2: room.pongState.player2.score,
    });
};

const resetBallPosition = (
    room: roomInterface,
    server: Server) => {
    // set players && ball on server side 
    room.pongState.ball.x = convertToPixel(50, canvasWidth);
    const randY: number = 100 * Math.random();
    room.pongState.ball.y = convertToPixel(randY, canvasHeight);
    room.pongState.ball.speedX = 0.5;
    room.pongState.ball.speedY = 0.5;
    sendBallPosition(room, server);
    sendBallVector(room, server);
}

const handleResetPlayerPosition = (
    room: roomInterface,
    server: Server) => {
    // Check who win round
    if (room.pongState.ball.x <= radiusBall) {
        room.pongState.player2.score++;
        room.pongState.ball.speedX = 1;
        room.pongState.ball.speedY = 1;
    } else {
        room.pongState.player1.score++;
        room.pongState.ball.speedX = -1;
        room.pongState.ball.speedY = -1;
    }
    resetBallPosition(room, server);
    sendScore(room, server);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Injectable()
export class GameService {
    constructor(
        private userService: UserService,
    ) { }
    async handleGame(room: roomInterface, server: Server) {
        // set ball position
        room.pongState.ball.x = convertToPixel(50, canvasWidth);
        room.pongState.ball.y = convertToPixel(50, canvasHeight);
        room.pongState.player1.y = canvasHeight / 3;
        room.pongState.player2.y = canvasHeight / 3;
        let timeToNewPower = 0;
        let timeToSendBallPosition = 0;
        const obstacles: obstaclesInterface[] = [];
        const powersAvailables: powerAvailables[] = [
            { id: 0, isActive: false, type: -1, x: 20, y: 20 },
            { id: 1, isActive: false, type: -1, x: 25, y: 50 },
            { id: 2, isActive: false, type: -1, x: 50, y: 25 },
            { id: 3, isActive: false, type: -1, x: 75, y: 25 },
            { id: 4, isActive: false, type: -1, x: 75, y: 50 },
            { id: 5, isActive: false, type: -1, x: 80, y: 80 },
        ]
        // Start loop of game
        while (1) {
            frameCount++;
            // check if game is finished
            if (room.pongState.player1.score == 5 || room.pongState.player2.score == 5) {
                console.log("END FRAME", frameCount);
                frameCount = 0;
                this.handleEndGame(room, server, false);
                return;
            }
            // check if modes is active
            if (room.pongState.modes) {
                timeToNewPower += 1;
                // return 1 if a new power was create
                handleNewPower(room, server, timeToNewPower, powersAvailables, obstacles);
                if (timeToNewPower === 100)
                    timeToNewPower = 0;
                handleColisionWithPower(room, server, obstacles, powersAvailables);
                handleColisionWithObstacle(room, server, obstacles);
            }
            timeToSendBallPosition++;
            if (timeToSendBallPosition === 5)
            {
                timeToSendBallPosition = 0;
                sendBallPosition(room, server);
            }
            // update ball position
            room.pongState.ball.x = room.pongState.ball.x + convertToPixel(room.pongState.ball.speedX, canvasWidth);
            room.pongState.ball.y = room.pongState.ball.y + convertToPixel(room.pongState.ball.speedY, canvasHeight);
            // check collision with players && walls
            handleCheckCollision(room, server);
            // check if someone loose the round
            if (room.pongState.ball.x <= radiusBall || room.pongState.ball.x >= canvasWidth - radiusBall)
            {
                console.log("player Y", convertToPixel(room.pongState.player1.y, canvasHeight), "playerX", convertToPixel(room.pongState.player2.y, canvasHeight), "ballX", room.pongState.ball.x, "ballY", room.pongState.ball.y, playerHeight, playerWidth);
                handleResetPlayerPosition(room, server);
            }
            await sleep(120);
        }
    }

    async handleEndGame(room: roomInterface, server: Server, forfeit: boolean) {
        let eloDiff = 0;
        if (room.pongState.player1.score > room.pongState.player2.score) {
            // increment Wins / Looses in DB
            await this.userService.incrementWin(room.pongState.player1.name);
            await this.userService.incrementLoose(room.pongState.player2.name);
            // Update Elo for each player
            const [eloWinner, eloLooser] = this.calcElo(room.pongState.player1, room.pongState.player2);
            await this.userService.updateElo(room.pongState.player1.name, eloWinner);
            await this.userService.updateElo(room.pongState.player2.name, eloLooser);
            eloDiff = eloWinner - room.pongState.player1.userInfos.elo;
            room.pongState.player1.userInfos.elo = eloWinner;
            room.pongState.player2.userInfos.elo = eloLooser;
            // Add Game in MatchHistory
            await this.userService.addGame(
                room.pongState.player1.userId,
                room.pongState.player1.score,
                room.pongState.player2.userId,
                room.pongState.player2.score,
                Math.abs(eloWinner - eloLooser),
                eloWinner,
                eloLooser,
                room.pongState.modes
            );
        } else {
             // increment Wins / Looses in DB
            await this.userService.incrementWin(room.pongState.player2.name);
            await this.userService.incrementLoose(room.pongState.player1.name);
            // Update Elo for each player
            const [eloWinner, eloLooser] = this.calcElo(room.pongState.player2, room.pongState.player1);
            await this.userService.updateElo(room.pongState.player2.name, eloWinner);
            await this.userService.updateElo(room.pongState.player1.name, eloLooser);
            eloDiff = eloWinner - room.pongState.player2.userInfos.elo;
            room.pongState.player2.userInfos.elo = eloWinner;
            room.pongState.player1.userInfos.elo = eloLooser;
            // Add Game in MatchHistory
            await this.userService.addGame(
                room.pongState.player2.userId,
                room.pongState.player2.score,
                room.pongState.player1.userId,
                room.pongState.player1.score,
                Math.abs(eloWinner - eloLooser),
                eloWinner,
                eloLooser,
                room.pongState.modes
            );
        }

        const user1 = await this.userService.getUserByName(room.pongState.player1.name);
        const user2 = await this.userService.getUserByName(room.pongState.player2.name);
        server.to(room.pongState.player1.id).emit('updateUser', user1, forfeit);
        server.to(room.pongState.player2.id).emit('updateUser', user2, forfeit);
        const endGame: PlayerEndGame = { id: 1, room, eloDiff, forfeit };
        server.to(room.pongState.player1.id).emit('endGame', endGame);
        endGame.id = 2;
        server.to(room.pongState.player2.id).emit('endGame', endGame);
        room.pongState.player1.score = 0;
        room.pongState.player2.score = 0;
    }

    calcElo(winner: PlayerInterface, looser: PlayerInterface): number[] {

        let eloWinner = winner.userInfos.elo;
        let eloLooser = looser.userInfos.elo;
        const p1 = eloWinner / (eloWinner + eloLooser);
        const p2 = eloLooser / (eloWinner + eloLooser);
        const k = 4.25 * (winner.score - looser.score);

        eloWinner = eloWinner + k * (1 - p1);
        eloLooser = eloLooser + k * (0 - p2);

        // prevent elo from reaching 0 or less
        if (eloLooser <= 0) eloLooser = 1;

        return [Math.round(eloWinner), Math.round(eloLooser)];
    }
}
