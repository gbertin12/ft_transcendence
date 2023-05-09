import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import io, { Socket } from 'socket.io-client';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';


export default function GameBody({socket} : {socket: Socket}) {
	const [playGame, setPlayGame] = useState(false);
	const [endGame, setEndGame] = useState(false);
	const [roomId, setRoomId] = useState('');
	const [dataEndGame, setDataEndGame] = useState({
		win: false, score1: 0, score2: 0 
	})
	
	const handleGameStart = (roomName: string) => {
		setPlayGame(true);
		setRoomId(roomName);
		setEndGame(false);
	}

	const handleSetEndGame = (win: boolean, score1: number, score2: number)  => {
		setDataEndGame({win, score1, score2});
		setRoomId('');
		setPlayGame(false);
		setEndGame(true);
	}

	const handleCloseCardEndGame = () => {
		setEndGame(false);
	}
	return <CardEndGame win={true} score1={8} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
	if (!playGame && !endGame)
		return <ButtonStart socket={socket} playGame={playGame} handleGameStart={handleGameStart} />
	else if (!playGame && endGame)
		return <CardEndGame win={dataEndGame['win']} score1={dataEndGame['score1']} score2={dataEndGame['score2']} handleCloseCardEndGame={handleCloseCardEndGame} />
	else if (playGame)
		return <Pong socket={socket} roomId={roomId} handleSetEndGame={handleSetEndGame} />
}