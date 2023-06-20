import styles from '../../styles/pong.module.css'
import { useState, useEffect, useRef, useCallback, use } from 'react';
import io, { Socket } from 'socket.io-client';
import { useUser } from '@/contexts/user.context';
import { Col } from '@nextui-org/react';
import Sketch from "react-p5";
import p5Types from "p5";
import dynamic from 'next/dynamic'
import { PlayerEndGame } from '@/interfaces/pong.interface';

interface Power {
	isActive: boolean;
	x: number;
	y: number;
	id: number;
	type: number;
}

interface Obstacle {
	isActive: boolean;
	x: number;
	y: number;
	id: number;
	size: number;
}

const canvasHeightServerSide : number = 500;
const canvasWidthServerSide : number = 1000;

//#region setup variables game
// images
let bounce: p5Types.Image;
let power: p5Types.Image;
let fence: p5Types.Image;

// paddles
let paddleWidth : number;
let paddleHeight : number;
let paddlePlayer1Y : number;
let paddlePlayer2Y : number;
let speedPaddle : number;

// ball
let ballX : number;
let ballY : number;
let ballSize : number;
let ballSpeedY : number;
let ballSpeedX : number;

// score
let score1 : number = 0;
let score2 : number = 0;
//#endregion

let mapPowers : Power[] = [
	{ isActive: false, x : 0, y : 0, id : 0, type : -1 },
	{ isActive: false, x : 0, y : 0, id : 1, type : -1 },
	{ isActive: true, x : 0, y : 0, id : 2, type : -1 },
	{ isActive: false, x : 0, y : 0, id : 3, type : -1 },
	{ isActive: true, x : 0, y : 0, id : 4, type : -1 },
	{ isActive: true, x : 0, y : 0, id : 5, type : -1 }
];

let mapObstacles : Obstacle[] = [
	{ isActive: false, x : 0, y : 0, id : 0, size : 0 },
	{ isActive: false, x : 0, y : 0, id : 1, size : 0 },
];

const convertToPixel = (value: number, maxValue: number) => {
    return (value * maxValue) / 100;
};

const Pong2 = ({roomName, who, handleSetEndGame} 
	: {roomName : string, who : number, handleSetEndGame : (endGame: PlayerEndGame) => void}) => {
	const { socket, user } = useUser();

	let p5lib : p5Types;
	const sketchRef = useRef(null);
	const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
		ssr: false,
	});

	const preload = (p5: p5Types) => {
		bounce=p5.loadImage("bounce.png");
		power=p5.loadImage("power.png");
		fence=p5.loadImage("fence.png");
	}
	
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(p5.windowWidth * 0.6, p5.windowWidth * 0.6 * 0.7).parent(canvasParentRef);
		p5lib = p5;
		// set paddles
		paddleWidth = p5.width / 80;
		paddleHeight = p5.height * 0.125;
		paddlePlayer1Y = p5.height / 2 - paddleHeight / 2;
		paddlePlayer2Y = p5.height / 2 - paddleHeight / 2;
		speedPaddle = p5.height / 50;
		
		// set ball
		ballSize = p5.width * 0.02;
		ballX = p5.width / 2 - ballSize / 2;
		ballY = p5.height / 2 - ballSize / 2;
		const ratioX = canvasHeightServerSide / p5lib.height;
		const ratioY = canvasWidthServerSide / p5lib.width;
		ballSpeedX = 1 / ratioX;
		ballSpeedY = 1 / ratioY;

		// resize images
		bounce.resize(50, 50);
		power.resize(50, 50);
		fence.resize(50, 50);

		p5.frameRate(60);
	}

	const draw = (p5: p5Types) => {
		// draw background
		p5.background(0);
		p5.fill(255);
		p5.stroke(255);

		// draw paddles
		p5.rect(0, paddlePlayer1Y, paddleWidth, paddleHeight);
		p5.rect(p5.width - paddleWidth, paddlePlayer2Y, paddleWidth, paddleHeight);

		// update ball position
		ballX += ballSpeedX;
		ballY += ballSpeedY;

		// ball out of canvas
		if (ballX < 0 || ballX > p5.width || ballY < 0 || ballY > p5.height) {
			ballX = p5.width / 2 - ballSize / 2;
			ballY = p5.height / 2 - ballSize / 2;	
		}
		// handle paddle movement
		handlePaddleMove();
		// draw ball
		p5.ellipse(ballX, ballY, ballSize, ballSize);

		// draw score
		p5.textSize(32);
		p5.text(score1, p5.width / 2 - 50, 50);
		p5.text(score2, p5.width / 2 + 50, 50);
	}

	const handleWindowResize = () => {
		if (p5lib)
			p5lib.createCanvas(p5lib.windowWidth * 0.6, p5lib.windowWidth * 0.6* 0.7);
	};

	const handlePaddleMove = () => {
		if (p5lib)
		{
			let percent : number = -1;
			if (p5lib.keyIsDown(p5lib.UP_ARROW)) {
				if (who === 0)
				{
					if (paddlePlayer1Y - speedPaddle < 0)
						paddlePlayer1Y = 0;
					else
						paddlePlayer1Y -= speedPaddle;

					percent = paddlePlayer1Y / p5lib.height * 100;
				} else {
					if (paddlePlayer2Y - speedPaddle < 0)
						paddlePlayer2Y = 0;
					else
						paddlePlayer2Y -= speedPaddle;

					percent = paddlePlayer2Y / p5lib.height * 100;
				}
			} else if (p5lib.keyIsDown(p5lib.DOWN_ARROW)) {
				if (who === 0)
				{
					if(paddlePlayer1Y + speedPaddle > p5lib.height)
						paddlePlayer1Y = p5lib.height;
					else
						paddlePlayer1Y += speedPaddle;

					percent = paddlePlayer1Y / p5lib.height * 100;
				} else {
					if (paddlePlayer2Y + speedPaddle > p5lib.height)
						paddlePlayer2Y = 0;
					else
						paddlePlayer2Y += speedPaddle;

					percent = paddlePlayer2Y / p5lib.height * 100;
				}
			}
			if (percent != -1)
			{
				socket.emit('playerMove', {
					percent : percent, 
					clientId : socket.id, 
					room : roomName
				});
			}
		}
	}

	useEffect(() => {
		window.addEventListener('resize', handleWindowResize);
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		}
	}), [];

	useEffect(() => {
		socket.on('playerMove', ({player, percent} : {player : number, percent : number}) => {
			if (p5lib)
			{
				if (player != who)
				{
					if (player === 0) 
						paddlePlayer1Y = p5lib.height * percent / 100;
					else
						paddlePlayer2Y = p5lib.height * percent / 100;
				}
			}
		});
		socket.on('updateScore',  ({ scorePlayer1, scorePlayer2 }: { scorePlayer1: number, scorePlayer2: number })=> {
			score1 = scorePlayer1;
			score2 = scorePlayer2;
		});
		socket.on('updateBallVector', ({ speedX, speedY } : { speedX: number, speedY: number }) => {
			if (p5lib)
			{
				console.log("frame", p5lib.frameCount)
				const ratioX = canvasHeightServerSide / p5lib.height;
				const ratioY = canvasWidthServerSide / p5lib.width;
				ballSpeedX = speedX / ratioX;
				ballSpeedY = speedY / ratioY;
			}
		});
		socket.on('updateBallPosition', ({ x, y }: { x: number, y: number }) => {
			if (p5lib)
			{
				ballX = convertToPixel(x, p5lib.width);
				ballY = convertToPixel(y, p5lib.height);
			}
		});
		socket.on('endGame', (endGame: PlayerEndGame) => {
			console.log("frameEND", p5lib.frameCount);
			handleSetEndGame(endGame);
		});
		// socket.on('newPower', ({x, y, id, type} : {x: number, y : number, id : number, type : number}) => {
		// 	console.log("newPower");
		// 	for (let i = 0; i < mapPowers.length; i++)
		// 	{
		// 		if (mapPowers[i].id == id)
		// 		{
		// 			mapPowers[i].isActive = true;
		// 			mapPowers[i].y = y;
		// 			mapPowers[i].x = x;
		// 			mapPowers[i].type = type;
		// 			break ;
		// 		}
		// 	}
		// });
		// socket.on('removePower', ({id} : {id : number}) => {
		// 	console.log("removePower");
		// 	for (let i = 0; i < mapPowers.length; i++)
		// 	{
		// 		if (mapPowers[i].id == id)
		// 		{
		// 			mapPowers[i].isActive = false;
		// 			mapPowers[i].y = 0;
		// 			mapPowers[i].x = 0;
		// 			mapPowers[i].type = -1;
		// 			break ;
		// 		}
		// 	}
		// });
		return () => {
			socket.off('playerMove');
			socket.off('updateScore');
			socket.off('updateBallVector');
			socket.off('endGame');
			socket.off('newPower');
			socket.off('removePower');
		}
	}, [socket, roomName]);

	return (
		<div>
			<Sketch preload={preload} setup={setup} draw={draw} />;
		</div>
	);
}

export default Pong2;
