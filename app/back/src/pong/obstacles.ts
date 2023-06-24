/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */

import { Server } from 'socket.io';
import {roomInterface, obstaclesInterface} from '../../src/interfaces/pong.interface';
import { convertToPixel } from './game.service';


const canvasHeight = 300;
const canvasWidth = 500;
const widthObstacle = canvasWidth / 50;


export const handleColisionWithObstacle = (room: roomInterface, server: Server, obstacles: obstaclesInterface[]) => {
    for (let i = 0; i < obstacles.length; i++)
    {
        if (room.pongState.ball.x > convertToPixel(obstacles[i].x, canvasWidth) &&
            room.pongState.ball.x < convertToPixel(obstacles[i].x, canvasWidth) + widthObstacle) {

            if (room.pongState.ball.y > convertToPixel(obstacles[i].y, canvasHeight) &&
            room.pongState.ball.y < convertToPixel(obstacles[i].y, canvasHeight) + convertToPixel(obstacles[i].size, canvasHeight)) {
                room.pongState.ball.speedX = -room.pongState.ball.speedX;
                
            }
            else if (obstacles[i].y === 0 && room.pongState.ball.y <= convertToPixel(obstacles[i].size, canvasHeight)) {
                room.pongState.ball.speedY = -room.pongState.ball.speedY;
            } 

            else if (obstacles[i].y !== 0 && room.pongState.ball.y <= convertToPixel(obstacles[i].y, canvasHeight)) {
                room.pongState.ball.speedY = -room.pongState.ball.speedY;
            } 
        }
    }
}

