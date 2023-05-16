/* eslint-disable prettier/prettier */
import { Server } from 'socket.io';
import {roomInterface, PowerInterface, obstaclesInterface} from '../../interfaces/pong.interface';
import {convertToPixel} from './handleGame.gateway';
import {getType,createObstacle} from './handleObstacle.gateway'
import { get } from 'http';

// set playground value
const canvasHeight = 300;
const canvasWidth = 500;
const playerHeight = canvasHeight / 4;
const radiusBall = 10;
const spaceBetweenPlayerAndWall = canvasWidth * 0.05;


const getAvailablePower = (powerAvailables: { key: number, value: boolean }[], nbPowers : number) => {
	const id = Math.floor(Math.random() *  powerAvailables.length - nbPowers);
	let i = 0;
	let nbAvailable = 0;
	while (nbAvailable < id && i < powerAvailables.length)
	{
		if (powerAvailables[i].value == true)
		{
			nbAvailable++;
			if (nbAvailable == id)
			{
				powerAvailables[i].value = false;
				return powerAvailables[i].key;
			}
		}
		i++;
	}
	return 0;
};


// Create New Power on Canvas && Add Power to the list of power in game
export const handleNewPower = (
	room: roomInterface,
	server: Server,
	timeToNewPower: number,
	powers: PowerInterface[],
	powerAvailables: { key: number, value: boolean }[],
	obstacles: obstaclesInterface[]
  	) => {
	if (timeToNewPower === 100) 
	{
		timeToNewPower = 0;
	  	if (powers.length < 3) 
		{
			const idPower = getAvailablePower(powerAvailables, obstacles.length);
			const type = getType(obstacles, powers);
			const newPower = {
		  	x: Math.floor(Math.random() * 60) + 20,
		  	y: Math.floor(Math.random() * 60) + 20,
		  	type: type,
		  	time: 0,
		  	id: idPower,
			};
			powers.push(newPower);
			server.to(room.pongState.player1.id).emit('newPower', {
			  	x: newPower.x,
			  	y: newPower.y,
			  	id: idPower,
				type: newPower.type
			});
			server.to(room.pongState.player2.id).emit('newPower', {
			  	x: 100 - newPower.x,
			  	y: 100 - newPower.y,
			  	id: idPower,
				type: newPower.type
			});
			return true;
	  	}
	}
	return false;
  };

export const handleColisionWithPower = (room: roomInterface, server: Server, powers: PowerInterface[], obstacles: obstaclesInterface[], powerAvailables: { key: number, value: boolean }[]) => {
	powers.forEach((power) => {
	  if (room.pongState.ball.x > convertToPixel(power.x, canvasWidth) - 10 &&
		room.pongState.ball.x < convertToPixel(power.x, canvasWidth) + 10 &&
		room.pongState.ball.y > convertToPixel(power.y, canvasHeight) - 20 &&
		room.pongState.ball.y < convertToPixel(power.y, canvasHeight) + 20
	  ) 
	  	{
			powerAvailables[power.id].value = true;
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
				console.log("change direction ")
				let newSpeedY = -room.pongState.ball.speedY
				if (newSpeedY < 0)
					newSpeedY -= 0.2;
				else
					newSpeedY += 0.2;
			  	room.pongState.ball.speedY = newSpeedY;
			} else 
			{
				// spawn obstacles bonus
				console.log('spawn object');
				createObstacle(server, room, obstacles);
			}
			powers.splice(powers.indexOf(power), 1);
		}
	});
};