import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import {Container, Row, Spacer, Text } from '@nextui-org/react'
import io, { Socket } from 'socket.io-client';
import CardPlayerInformation from './CardPlayerInformation';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';


export default function GameBody({socket} : {socket: Socket}) {
	const [playGame, setPlayGame] = useState(false);
	const [endGame, setEndGame] = useState(false);
	const [roomId, setRoomId] = useState('');
	const [searchGame, setSearchGame] = useState(false);
	const [dataEndGame, setDataEndGame] = useState({
		win: false, score1: 0, score2: 0 
	})
	
	const handleGameStart = (roomName: string) => {
		setPlayGame(true);
		setRoomId(roomName);
		setEndGame(false);
	}

	const handleSetSearchGame = (value: boolean) => {
			setSearchGame(value);
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
	//return <Pong socket={socket} roomId={roomId} handleSetEndGame={handleSetEndGame} />
	//return <CardEndGame win={true} score1={10} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
	if (!playGame && !endGame)
	{
		return <>
			<Container>
				<Row justify='center'>
					<CardPlayerInformation searchGame={false} username={"gbertin"} avatar="https://i.imgur.com/fjZQLH6.png" elo={1200} nbWin={8} nbLoose={3} />
					<Spacer x={2} />
					<Text css={{ my:'auto' }} h1>VS</Text>
					<Spacer x={2} />
					<CardPlayerInformation searchGame={searchGame} username={"Adversary"} avatar="https://i.imgur.com/pLGJ0Oj.jpeg" elo={0} nbWin={0} nbLoose={0} />
				</Row>
			</Container>
			<Spacer y={2} />
			<ButtonStart searchGame={searchGame} socket={socket} playGame={playGame} handleGameStart={handleGameStart} handleSetSearchGame={handleSetSearchGame} />
		</>
	}
	else if (!playGame && endGame)
	{
		return <>
			<CardEndGame win={dataEndGame['win']} score1={dataEndGame['score1']} score2={dataEndGame['score2']} handleCloseCardEndGame={handleCloseCardEndGame} />
		</>
	}
	else if (playGame) {
		return <>
			<Pong socket={socket} roomId={roomId} handleSetEndGame={handleSetEndGame} />
		</>
	}
}