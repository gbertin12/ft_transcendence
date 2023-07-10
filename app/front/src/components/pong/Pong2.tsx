import styles from '../../styles/pong.module.css'
import { useState, useEffect, useRef, useCallback, use } from 'react';
import io, { Socket } from 'socket.io-client';
import { useUser } from '@/contexts/user.context';
import { Col } from '@nextui-org/react';
import Sketch from "react-p5";
import p5Types from "p5";
import dynamic from 'next/dynamic'
import { PlayerEndGame } from '@/interfaces/pong.interface';
import axios from 'axios';

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

const canvasHeightServerSide : number = 250;
const canvasWidthServerSide : number = 500;
let resize = 1;

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

let titleSize : number;
let textSize : number;

// ball
let ballX : number;
let ballY : number;
let ballSize : number;

// score
let score1 : number = 0;
let score2 : number = 0;
//#endregion

let mapPowers : Power[];


const convertToPixel = (value: number, maxValue: number) => {
    return (value * maxValue) / 100;
};


const Pong2 = ({nameOpponent, windowWidth, roomName, who, handleSetEndGame} 
	: {nameOpponent : string, windowWidth : number, roomName : string, who : number, handleSetEndGame : (endGame: PlayerEndGame) => void}) => {
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

	const setSize = (p5 : p5Types) => {
		//p5.resizeCanvas(p5.windowWidth * 0.6, p5.windowWidth * 0.6 * 0.7);
		// set paddles
		paddleWidth = p5.width / 80;
		paddleHeight = p5.height / 8;
		paddlePlayer1Y = p5.height / 2 - paddleHeight / 2;
		paddlePlayer2Y = p5.height / 2 - paddleHeight / 2;
		speedPaddle = p5.height / 50;
		
		// set ball
		ballSize = p5.width * 0.02;
		ballX = p5.width / 2 - ballSize / 2;
		ballY = p5.height / 2 - ballSize / 2;

		// resize images
		bounce.resize(p5.width / 16, p5.width / 16);
		power.resize(p5.width / 16 / 1.5, p5.width / 16);
		fence.resize(p5.width / 16, p5.width / 16);

		// set title size
		titleSize = p5.width / 20;
		textSize = p5.width / 40;
	}
	
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.stroke("#F5A524");
		p5.strokeWeight(4);
		p5.createCanvas(p5.windowWidth * 0.6, p5.windowWidth * 0.6 * 0.7).parent(canvasParentRef);
		p5.strokeWeight(1);
		p5.resizeCanvas(windowWidth * 0.6, windowWidth * 0.6 * 0.7);
		p5lib = p5;
		resize = 1;
		setSize(p5);
		mapPowers = [
			{ isActive: false, x : 0, y : 0, id : 0, type : 0 },
			{ isActive: false, x : 0, y : 0, id : 1, type : 0 },
			{ isActive: false, x : 0, y : 0, id : 2, type : 0 },
			{ isActive: false, x : 0, y : 0, id : 3, type : 0 },
			{ isActive: false, x : 0, y : 0, id : 4, type : 0 },
			{ isActive: false, x : 0, y : 0, id : 5, type : 0 }
		]

		score1 = 0;
		score2 = 0;

		p5.frameRate(60);
	}

	const draw = (p5: p5Types) => {
		p5lib = p5;
		// draw background
		p5.background(0);
		p5.fill(255);
		p5.stroke(255);

		// draw powers
		let WidthPower = p5.width / 16;
		for (let i = 0; i < mapPowers.length; i++) {
			if (mapPowers[i].isActive) {
				if (mapPowers[i].type == 0)
				p5.image(power, mapPowers[i].x - WidthPower, mapPowers[i].y - WidthPower);
				else if (mapPowers[i].type == 1)
				p5.image(bounce, mapPowers[i].x - WidthPower, mapPowers[i].y - WidthPower);
				else if (mapPowers[i].type == 2)
				p5.image(fence, mapPowers[i].x - WidthPower, mapPowers[i].y - WidthPower);
			}
		}
		
		// handle paddle movement
		handlePaddleMove();
		// draw ball
		p5.ellipse(ballX, ballY, ballSize, ballSize);
		
		p5.textSize(titleSize);
		let margeUsername1 = p5.width / 3;
		let margeUsername2 = p5.width / 4;
		p5.fill("#17C964")
		if (who == 0)
		{
			p5.text(score1, p5.width / 2 - 50, 50);
			p5.textSize(textSize);
			p5.text(user.name, p5.width / 2 - margeUsername1, 50);
			p5.rect(0, paddlePlayer1Y, paddleWidth, paddleHeight);
		} else {
			p5.fill("#F31260");
			p5.text(score1, p5.width / 2 - 50, 50);
			p5.textSize(textSize);
			p5.text(nameOpponent, p5.width / 2 - margeUsername1, 50);
			p5.rect(0, paddlePlayer1Y, paddleWidth, paddleHeight);
		}
		p5.textSize(titleSize);
		p5.fill("#17C964")
		if (who == 1)
		{
			p5.text(score2, p5.width / 2 + 50, 50);
			p5.textSize(textSize);
			p5.text(user.name, p5.width / 2 + margeUsername2, 50);
			p5.rect(p5.width - paddleWidth, paddlePlayer2Y, paddleWidth, paddleHeight);
		} else {
			p5.fill("#F31260");
			p5.text(score2, p5.width / 2 + 50, 50);
			p5.textSize(textSize);
			p5.text(nameOpponent, p5.width / 2 + margeUsername2, 50);
			p5.rect(p5.width - paddleWidth, paddlePlayer2Y, paddleWidth, paddleHeight);
		}
	}

	const handleWindowResize = () => {
		if (p5lib)
		{
			p5lib.resizeCanvas(p5lib.windowWidth * 0.6, p5lib.windowWidth * 0.6 * 0.7)
			setSize(p5lib);
		}
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
				} else if (who === 1) {
					if (paddlePlayer2Y - speedPaddle < 0)
						paddlePlayer2Y = 0;
					else
						paddlePlayer2Y -= speedPaddle;
					percent = paddlePlayer2Y / p5lib.height * 100;
				}
			} else if (p5lib.keyIsDown(p5lib.DOWN_ARROW)) {
				if (who === 0)
				{
					if(paddlePlayer1Y + speedPaddle > p5lib.height - paddleHeight)
						paddlePlayer1Y = p5lib.height - paddleHeight;
					else
						paddlePlayer1Y += speedPaddle;
					percent = paddlePlayer1Y / p5lib.height * 100;
				} else if (who === 1) {
					if (paddlePlayer2Y + speedPaddle > p5lib.height - paddleHeight)
						paddlePlayer2Y = p5lib.height - paddleHeight;
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
		axios.patch(`http://localhost:3000/friends/status/playing`, {}, { withCredentials: true, validateStatus: () => true });
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
		socket.on('updateBallPosition', ({ x, y }: { x: number, y: number }) => {
			if (p5lib)
			{
				ballX = convertToPixel(x, p5lib.width);
				ballY = convertToPixel(y, p5lib.height);
			}
		});
		socket.on('endGame', (endGame: PlayerEndGame) => {
			handleSetEndGame(endGame);
		});
		socket.on('newPower', ({x, y, id, type} : {x: number, y : number, id : number, type : number}) => {
			if (p5lib)
			{
				let newX = convertToPixel(x, p5lib.width);
				let newY = convertToPixel(y, p5lib.height);
				for (let i = 0; i < mapPowers.length; i++)
				{
					if (mapPowers[i].id == id)
					{
						mapPowers[i].isActive = true;
						mapPowers[i].y = newY;
						mapPowers[i].x = newX;
						mapPowers[i].type = type;
						break ;
					}
				}
			}
		});
		socket.on('removePower', ({id} : {id : number}) => {
			if (p5lib)
			{
				for (let i = 0; i < mapPowers.length; i++)
				{
					if (mapPowers[i].id == id)
					{
						mapPowers[i].isActive = false;
						mapPowers[i].y = 0;
						mapPowers[i].x = 0;
						mapPowers[i].type = -1;
						break ;
					}
				}
			}
		});
		return () => {
			socket.off('playerMove');
			socket.off('updateScore');
			socket.off('updateBallPosition');
			socket.off('endGame');
			socket.off('newPower');
			socket.off('removePower');
		}
	}, [socket, roomName]);

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{ textAlign: 'center' }}>
				{/* @ts-ignore */}
				<Sketch preload={preload} setup={setup} draw={draw} />
			</div>
		</div>
	)
}

export default Pong2;
