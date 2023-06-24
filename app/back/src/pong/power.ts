/* eslint-disable prettier/prettier */
import { Server } from 'socket.io';
import { roomInterface, PowerInterface, obstaclesInterface, powerAvailables } from '../../src/interfaces/pong.interface';
import { convertToPixel } from './game.service';

// set playground value
const canvasHeight = 300;
const canvasWidth = 500;


const setAvailablePower = (
	powerAvailables: powerAvailables[],
	nbPowers: number,
	obstacles: obstaclesInterface[],
): number => {

	const id = Math.floor(Math.random() * (powerAvailables.length - nbPowers));
	let i = 0;
	let nbAvailable = 0;
	while (nbAvailable != id && i < powerAvailables.length) {
		if (powerAvailables[i].isActive == false)
			nbAvailable++;
		i++;
	}
	const type = Math.floor(Math.random() * 2);
	while (powerAvailables[i].isActive && i < powerAvailables.length)
		i++;
	//const type = 2;
	powerAvailables[i].isActive = true;
	powerAvailables[i].type = type;
	return i;
};

const countNbPowersUses = (powerAvailables: powerAvailables[]): number => {
	let count = 0;
	let i = 0;
	while (i < powerAvailables.length) {
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
): boolean => {
	if (timeToNewPower === 100) {
		timeToNewPower = 0;
		const nbPowers = countNbPowersUses(powerAvailables);
		if (nbPowers < 3) {
			const id = setAvailablePower(powerAvailables, nbPowers, obstacles);
			server.to(room.name).emit('newPower', {
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
	const powerSize : number = canvasWidth / 16 -5;
	powerAvailables.forEach((power) => {
		if (power.isActive &&
			room.pongState.ball.x > convertToPixel(power.x, canvasWidth) - powerSize &&
			room.pongState.ball.x < convertToPixel(power.x, canvasWidth) + powerSize &&
			room.pongState.ball.y > convertToPixel(power.y, canvasHeight) - powerSize &&
			room.pongState.ball.y < convertToPixel(power.y, canvasHeight) + powerSize
		) {
			server.to(room.name).emit('removePower', {
				id: power.id,
			});
			if (power.type === 0) {
				//speed up bonus
				if (room.pongState.ball.speedX < 0)
					room.pongState.ball.speedX -= 0.4;
				else
					room.pongState.ball.speedX += 0.4;
				if (room.pongState.ball.speedY < 0)
					room.pongState.ball.speedY -= 0.4;
				else
					room.pongState.ball.speedY += .3;0
				// check speed X
				if (room.pongState.ball.speedX > 2)
					room.pongState.ball.speedX = 2;
				else if (room.pongState.ball.speedX < -2)
					room.pongState.ball.speedX = -2;
				// check speed Y
				if (room.pongState.ball.speedY > 2)
					room.pongState.ball.speedY = 2;
				else if (room.pongState.ball.speedY < -2)
					room.pongState.ball.speedY = -2;
			}
			else if (power.type === 1) {
				// bounce bonus
				let newSpeedY = -room.pongState.ball.speedY;
				if (newSpeedY < 0)
					newSpeedY -= 0.4;
				else
					newSpeedY += 0.4;
				room.pongState.ball.speedY = newSpeedY;
			} 
			powerAvailables[power.id].isActive = false;
			powerAvailables[power.id].type = -1;
		}
	});
};