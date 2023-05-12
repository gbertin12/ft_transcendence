
import { Server } from 'socket.io';
import {roomInterface, PowerInterface, ObstacleInterface} from 'src/interfaces/pong.interface';
import {convertToPixel} from './handleGame.gateway';

export const getType = (obstacles: ObstacleInterface[], powers: PowerInterface) => {
	let type = Math.floor(Math.random() * 3);
	if (type == 2)
	{
		let nbObs = obstacles.length;
		for (let i = 0; i < powers.length; i++)
			if (powers.type == 2)
				nbObs++;
		if (nbObs >= 2)
			type = Math.floor(Math.random() * 2)
	}
	return type;
}

export const createObstacle(room: roomInterface, server: Server, obstacles: ObstacleInterface) => {
	let obstacle: ObstacleInterface = {

	}


}