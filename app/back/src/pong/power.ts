/* eslint-disable prettier/prettier */
import { Server } from 'socket.io';
import {roomInterface, PowerInterface, obstaclesInterface, powerAvailables} from '../../src/interfaces/pong.interface';
import {convertToPixel} from './game.service';
import {getType,createObstacle} from './obstacles'
import { get } from 'http';

// set playground value
const canvasHeight = 300;
const canvasWidth = 500;
const playerHeight = canvasHeight / 4;
const radiusBall = 10;
const spaceBetweenPlayerAndWall = canvasWidth * 0.05;


const setAvailablePower = (
	powerAvailables: powerAvailables[],
	nbPowers : number,
	obstacles: obstaclesInterface[],
	) : number  => {

	const id = Math.floor(Math.random() * (powerAvailables.length - nbPowers));
	let i = 0;
	let nbAvailable = 0;
	while (nbAvailable != id && i < powerAvailables.length)
	{
		if (powerAvailables[i].isActive == false)
			nbAvailable++;
		i++;
	}
	const type = getType(obstacles, powerAvailables);
	while (powerAvailables[i].isActive && i < powerAvailables.length)
		i++;
	//const type = 2;
	powerAvailables[i].isActive = true;
	powerAvailables[i].type = type;
	return i;
};

const countNbPowersUses = (powerAvailables: powerAvailables[]) : number => {
	let count = 0;
	let i = 0;
  	while (i < powerAvailables.length)
	{
		if (powerAvailables[i].isActive)
			count++;
		i++
	}
	return count;
}

// Create New Power on Canvas && Add Power to the list of power in game
export const handleNewPower = (
	room: roomInterface,
	server: Server,
	timeToNewPower: number,
	powerAvailables: powerAvailables[],
	obstacles: obstaclesInterface[]
  	) : boolean => {
	if (timeToNewPower === 100) 
	{
		timeToNewPower = 0;
		const nbPowers = countNbPowersUses(powerAvailables);
	  	if (nbPowers < 3) 
		{
			const id = setAvailablePower(powerAvailables, nbPowers, obstacles);
				server.to(room.pongState.player1.id).emit('newPower', {
					x: powerAvailables[id].x,
					y: powerAvailables[id].y,
					id: powerAvailables[id].id,
					type: powerAvailables[id].type
				});
				server.to(room.pongState.player2.id).emit('newPower', {
					x: powerAvailables[id].x,
					y: powerAvailables[id].y,
					id: powerAvailables[id].id,
					type: powerAvailables[id].type
				});
				return true;
	  	}
	}
	return false;
  };

export const handleColisionWithPower = (room: roomInterface, server: Server, obstacles: obstaclesInterface[], powerAvailables: powerAvailables[]) => {
	let id : number = -1;
	powerAvailables.forEach((power) => {
	  if (power.isActive &&
		room.pongState.ball.x > convertToPixel(power.x, canvasWidth) - 10 &&
		room.pongState.ball.x < convertToPixel(power.x, canvasWidth) + 10 &&
		room.pongState.ball.y > convertToPixel(power.y, canvasHeight) - 20 &&
		room.pongState.ball.y < convertToPixel(power.y, canvasHeight) + 20
	  ) 
	  	{
			server.to(room.pongState.player1.id).emit('removePower', {
				id: power.id,
			});
			server.to(room.pongState.player2.id).emit('removePower', {
			  	id: power.id,
			});
			if (power.type === 0) 
			{
				//speed up bonus
				if (room.pongState.ball.speedX < 0)
					room.pongState.ball.speedX -= 0.3;
				else
					room.pongState.ball.speedX += 0.3;
					if (room.pongState.ball.speedY < 0)
					room.pongState.ball.speedY -= 0.3;
					else
					room.pongState.ball.speedY += 0.3;
				} 
			else if (power.type === 1) 
			{
				// bounce bonus
				let newSpeedY = -room.pongState.ball.speedY;
				if (newSpeedY < 0)
					newSpeedY -= 0.2;
				else
					newSpeedY += 0.2;
				room.pongState.ball.speedY = newSpeedY;
			} else if (power.type === 2)
			{
				// spawn obstacles bonus
				createObstacle(server, room, obstacles);
			}
			powerAvailables[power.id].isActive = false;	
			powerAvailables[power.id].type = -1;
		}
	});
};