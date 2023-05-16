/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */

import { Server } from 'socket.io';
import {roomInterface, PowerInterface,  obstaclesInterface} from '../../interfaces/pong.interface';
import { convertToPixel } from './handleGame.gateway';

const canvasHeight = 300;
const canvasWidth = 500;

const obstacle1 = {
	x: 33,
	y: 0,
	size: 0,
	id: 0,
}

const obstacle2 = {
	x: 66,
	y: 0,
	size: 0,
	id: 1,
}

export const handleColisionWithObstacle = (room: roomInterface, obstacles: obstaclesInterface[]) => {
	for (let i = 0; i < obstacles.length; i++)
	{
		if (room.pongState.ball.x > convertToPixel(obstacles[i].x, canvasWidth) &&
			room.pongState.ball.x < convertToPixel(obstacles[i].x, canvasWidth) + 12 &&
			room.pongState.ball.y > convertToPixel(obstacles[i].y, canvasHeight) &&
			room.pongState.ball.y < convertToPixel(obstacles[i].y, canvasHeight) + obstacles[i].size)
		{
			room.pongState.ball.speedX = -room.pongState.ball.speedX;
			room.pongState.ball.speedY = -room.pongState.ball.speedY;
		}
	}
}

export const getType = (obstacles: obstaclesInterface[], powers: PowerInterface[]) => {
	let type = Math.floor(Math.random() * 3);
	if (type == 2)
	{
		let nbObs = obstacles.length;
		for (let i = 0; i < powers.length; i++)
			if (powers[i].type == 2)
				nbObs++;
		if (nbObs >= 2)
			type = Math.floor(Math.random() * 2)
	}
	return type;
}

export const createObstacle = (server: Server, room: roomInterface, obstacles: obstaclesInterface[]) => {

	const size = Math.floor(Math.random() * 20) + 10;
	let newObstacle = obstacle1;
	if (obstacles.length > 0)
	{
		newObstacle = obstacle2;
		newObstacle.size = size;
		newObstacle.y = 100 - size;
	}
	else
		newObstacle.size = size;
	obstacles.push(newObstacle);
	server.to(room.pongState.player1.id).emit('addObstacle', {
		x: newObstacle.x,
		y: newObstacle.y,
		id: newObstacle.id,	
		size: newObstacle.size
	});
	server.to(room.pongState.player2.id).emit('addObstacle', {
		x: 100 - newObstacle.x,
		y: newObstacle.y,
		id: newObstacle.id,	
		size: newObstacle.size
	});
}