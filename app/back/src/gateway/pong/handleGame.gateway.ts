/* eslint-disable prettier/prettier */
import { Server } from 'socket.io';
import {roomInterface, PowerInterface, obstaclesInterface} from '../../interfaces/pong.interface';
import { handleNewPower, handleColisionWithPower } from './handlePower.gateway';
import { NetworkInterfaceInfo } from 'os';
import { handleColisionWithObstacle } from './handleObstacle.gateway';

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

const handleEndGame = (room: roomInterface, server: Server) => {
  	const scoreP1: number = room.pongState.player1.score;
  	const scoreP2: number = room.pongState.player2.score;
  	room.pongState.player1.score = 0;
  	room.pongState.player2.score = 0;
  	if (scoreP1 == 10)
  	{
  	  	server.to(room.pongState.player1.id).emit('endGame', {win: true, score1: scoreP1, score2: scoreP2});
  	  	server.to(room.pongState.player2.id).emit('endGame', {win: false, score1: scoreP2, score2: scoreP1});
  	} 
	else 
	{
  	  	server.to(room.pongState.player1.id).emit('endGame', {win: false, score1: scoreP1, score2: scoreP2});
  	  	server.to(room.pongState.player2.id).emit('endGame', {win: true, score1: scoreP2, score2: scoreP1});
  	}
}	

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
	// check collision with obstacles

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

const initPlayerPosition = (room: roomInterface, server: Server) => {
	// set players && ball on server side 
	room.pongState.ball.x = convertToPixel(50, canvasWidth);
    room.pongState.ball.y = convertToPixel(50, canvasHeight);
    room.pongState.player1.y = 38.5;
    room.pongState.player2.y = 38.5;
	// send players position to client side
	server.to(room.pongState.player1.id).emit('resetPlayers', {percentP1: 38.5, percentP2: 38.5});
	server.to(room.pongState.player2.id).emit('resetPlayers', {percentP1: 38.5, percentP2: 38.5});
	server.to(room.pongState.player1.id).emit('resetObstacles');
	server.to(room.pongState.player2.id).emit('resetObstacles');
}

const handleResetPlayerPosition = (room: roomInterface, server: Server) => {
  // check who lose round
    if (room.pongState.ball.x <= radiusBall) 
	{
		room.pongState.player2.score++;
		//room.pongState.ball = player1Start;
		room.pongState.ball.speedX = 1;
		room.pongState.ball.speedY = 0.8;
		console.log(room.pongState.ball)
    } 
	else 
	{
      	room.pongState.player1.score++;
      	//room.pongState.ball = player2Start;
		room.pongState.ball.speedX = -1;
		room.pongState.ball.speedY = -0.8;
		console.log(room.pongState.ball)
    }
	initPlayerPosition(room, server);
    sendScore(room, server);
}

export const handleGame = (room: roomInterface, server: Server) => {
  	// set ball position
  	room.pongState.ball.x = convertToPixel(50, canvasWidth);
  	room.pongState.ball.y = convertToPixel(50, canvasHeight);
  	room.pongState.player1.y = canvasHeight / 3;
  	room.pongState.player2.y = canvasHeight / 3;
  	let timeToNewPower = 0;
	let initPlayer = true;
  	const powers: PowerInterface[] = [];
	const obstacles: obstaclesInterface[] = [];
	const powersAvailables: { key: number, value: boolean }[] = [
		{ key: 0, value: true },
		{ key: 1, value: true },
		{ key: 2, value: true },
		{ key: 3, value: true },
		{ key: 4, value: true },
		{ key: 5, value: true },
	];

  	const interval = setInterval(() => {
		if (initPlayer && room.pongState.player1.score == 0 && room.pongState.player2.score == 0)
		{
			initPlayer = false;
		  	initPlayerPosition(room, server);
		}
		// check if game is finished
		if (room.pongState.player1.score == 10 || room.pongState.player2.score == 10) 
		{
			clearInterval(interval);
			handleEndGame(room, server);
			return;
  	  	}
		if (room.pongState.modes)
		{
			timeToNewPower += 1;
			// return 1 if a new power was create
			handleNewPower(room, server, timeToNewPower, powers, powersAvailables, obstacles);
			if (timeToNewPower === 100) 
				timeToNewPower = 0;
			handleColisionWithPower(room, server, powers, obstacles, powersAvailables);
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
  	  	  	handleResetPlayerPosition(room, server);
  	}, 40);
};
