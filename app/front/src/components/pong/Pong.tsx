import styles from '../../styles/pong.module.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import Image from 'next/image'


function Player ({ x, y, canvasHeight } : {x: number, y: number, canvasHeight: number} ) {
	return (
		<div className={styles.player} style={{top: y, left: x, height: canvasHeight / 4}}></div>
	)
}

function Ball ({x, y} : {x: number, y: number}) {
	return (
		<div className={styles.ball} style={{top: y, left: x}}></div>
	)
}

function Power ({isActive, x, y, type} : {isActive: boolean, x: number, y: number, type: number}) {
	if (type === 0)
		return <>{isActive && <Image src="/power.png" alt='power' width={30} height={40} className={styles.power} style={{top: y, left: x}} />}</>
	else if (type === 1)
		return <>{isActive && <Image src="/bounce.png" alt='power' width={40} height={40} className={styles.power} style={{top: y, left: x}} />}</>
	else
		return <>{isActive && <Image src="/bounce.png" alt='power' width={40} height={40} className={styles.power} style={{top: y, left: x}} />}</>
}

const convertToPixel = (value: number, maxValue: number) => {
	return (value * maxValue) / 100;
  };

export default function Pong({socket, roomId, handleSetEndGame} : {socket: Socket, roomId: string, handleSetEndGame: (win: boolean, score1: number, score2: number) => void}) {
	const [score , setScore] = useState({scorePlayer1: 0, scorePlayer2: 0});
	const [ball, setBall] = useState({x: 0, y: 0});
	const [playerPosition, setPlayerPosition] = useState({yPlayerOne: 0, yPlayerTwo: 0});
	const [canvas, setCanvas] = useState({height: 0, width: 0, speedPlayer: 0});
	const [powers, setPowers] = useState([
		{isActive: false, x: 0, y: 0, id: 0, type: 0},
		{isActive: false, x: 0, y: 0, id: 0, type: 0},
		{isActive: false, x: 0, y: 0, id: 0, type: 0}
	]); // [{x: 0, y: 0, type: 'speedUp', time: 0}]
	const ref = useRef(null);


	// ==================================================================================================================

	// ======================== CallBack pour update les dimensions du canvas ============================================

	// CallBack pour update le canvas avec les nouvelles dimensions
	const callBackSetCanvasProperties = useCallback(() => {
		if (ref && ref.current) {
		  	const height = ref.current.getBoundingClientRect().height;
		  	const width = ref.current.getBoundingClientRect().width;
		  	const speedPlayer = height / 25;
		  	if (height !== canvas.height || width !== canvas.width) 
			{
				setCanvas((prevCanvas) => ({
				  	...prevCanvas,
				  	height,
				  	width,
				  	speedPlayer
				}));
		  	}
		}
	}, [canvas.height, canvas.width]);
	
	// ==================================================================================================================

	// ======================== CallBack pour update la position de la balle ============================================
	const handleKeyDown = useCallback((e) => {
		if (e.key ==='ArrowUp')
		{
			if (playerPosition.yPlayerOne -5 > 0)
			{
				setPlayerPosition({yPlayerOne: playerPosition.yPlayerOne - canvas.speedPlayer, yPlayerTwo: playerPosition.yPlayerTwo});
				var percent = (playerPosition.yPlayerOne - canvas.speedPlayer) * 100 / canvas.height;
				if (percent > 75)
					percent = 75;
				socket.emit('playerMove', {percent: percent, clientId: socket.id, room: roomId});
			}
		}
		if (e.key === 'ArrowDown')
		{
			if (playerPosition.yPlayerOne + canvas.speedPlayer < canvas.height - canvas.height / 4)
			{
				setPlayerPosition({yPlayerOne: playerPosition.yPlayerOne + canvas.speedPlayer, yPlayerTwo: playerPosition.yPlayerTwo});
				var percent = (playerPosition.yPlayerOne + canvas.speedPlayer) * 100 / canvas.height;
				if (percent > 75)
					percent = 75;
				socket.emit('playerMove', {percent: percent, clientId: socket.id, room: roomId});
			}
		}
	}, [playerPosition, canvas]);

	// =================================================================================================================
	
	// ======================== CallBack pour update la position de la balle ============================================

	const gameLoop = useCallback(() => {
		callBackSetCanvasProperties();
		setBall({ x: ball.x, y: ball.y});
	}, [ball, callBackSetCanvasProperties]);

	// ======================== Boucle de jeu ============================================

	const handleMovePlayer = (message: number) => {
		const newPos = message * canvas.height / 100;
		setPlayerPosition({yPlayerOne: playerPosition.yPlayerOne, yPlayerTwo: newPos})
	}

	const handleUpdateScore = ({scorePlayer1, scorePlayer2} : {scorePlayer1: number, scorePlayer2: number}) => {
		setScore({scorePlayer1, scorePlayer2});
	}

	const handleUpdateBall = ({x, y} : {x: number, y: number}) => {
		x = convertToPixel(x, canvas.width);
		y = convertToPixel(y, canvas.height);
		setBall({x, y});
	}

	const handleNewPowers = ({x, y, id, type} : {x: number, y: number, id:number, type:number}) => {
		console.log(x, y);
		const PixelX = convertToPixel(x, canvas.width);
		const PixelY = convertToPixel(y, canvas.height);
		var i = 0;
		console.log("new power id", id);
		while (i < 3 && powers[i].isActive)
			i++;
		if (i < 3)
		{
			setPowers(prevPowers => {
				return prevPowers.map((power, index) => {
					if (index === i) { 
						return { isActive: true, x: PixelX, y: PixelY, id: id, type: type};
				  	} else {
						return power; 
				  	}
				});
			});
		}
			
	}

	const handleRemovePower = ({id} : {id: number}) => {
		setPowers(prevPowers => {
			return prevPowers.map((power) => {
			  if (power.id == id) {
				return { isActive: false, x:0, y: 0, id: 0, type: 0};
			  } else {
				return power; 
			  }
			});
		});
	}

	const handleResetPlayer = ({percentP1, percentP2} : {percentP1: number, percentP2: number}) => {
		const newYP1 = convertToPixel(percentP1, canvas.height);
		const newYP2 = convertToPixel(percentP2, canvas.height);
		setPlayerPosition({yPlayerOne: newYP1, yPlayerTwo:newYP2});
	}

	const handleEndGame = ({win, score1, score2} : {win: boolean, score1: number, score2: number}) => {
		handleSetEndGame(win, score1, score2);
		console.log(win, score1, score2);
	}
	useEffect(() => {
			socket.on('playerMove', handleMovePlayer)
			socket.on('updateScore', handleUpdateScore)
			socket.on('updateBall', handleUpdateBall)
			socket.on('resetPlayers', handleResetPlayer)
			socket.on('newPower', handleNewPowers)
			socket.on('removePower', handleRemovePower)
			socket.on('endGame', handleEndGame)
			return () => {
				socket.off('playerMove', handleMovePlayer);
				socket.off('updateScore', handleUpdateScore);
				socket.off('updateBall', handleUpdateBall);
				socket.off('newPower', handleNewPowers);
				socket.off('resetPlayers')
				socket.off('removePower', handleRemovePower);
				socket.off('endGame', handleEndGame);
			}
	}, [handleMovePlayer, handleUpdateScore, handleUpdateBall]);

	useEffect(() => {
		if (socket)
		{
			
			requestAnimationFrame(gameLoop);
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				cancelAnimationFrame(gameLoop);
			}
		}
	}, [gameLoop, playerPosition, canvas, handleKeyDown, socket]);

	// ======================== Render ============================================
	// <Ball x={ball.x } y={ball.y } />
	return (
		<>
			<h1>My Pong</h1>
			<div className={styles.pong}>
				<div ref={ref} id="pong" className={styles.board}>
					<h2></h2>
					<h2 className={styles.scorePlayerOne}>{score.scorePlayer1}</h2>
					<h2 className={styles.scorePlayerTwo}>{score.scorePlayer2}</h2>
					<Ball x={ ball.x } y={ ball.y } />
					<Player x={canvas.width * 5 / 100 - 12} y={playerPosition.yPlayerOne} canvasHeight={canvas.height}/>
					<Player x={canvas.width - canvas.width * 5 / 100} y={playerPosition.yPlayerTwo} canvasHeight={canvas.height}/>
					<Power x={powers[0].x} y={powers[0].y} isActive={powers[0].isActive} type={powers[0].type}/>
					<Power x={powers[1].x} y={powers[1].y} isActive={powers[1].isActive} type={powers[1].type}/>
					<Power x={powers[2].x} y={powers[2].y} isActive={powers[2].isActive} type={powers[2].type}/>
				</div>
			</div>
		</>
	);
}