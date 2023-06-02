import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import {Container, Row, Spacer, Text, Checkbox } from '@nextui-org/react'
import io, { Socket } from 'socket.io-client';
import CardPlayerInformation from './CardPlayerInformation';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';
import { useUser } from '@/contexts/user.context';
import { User } from '../../interfaces/user.interface'


export default function GameBody() {
	const [playGame, setPlayGame] = useState(false);
	const [endGame, setEndGame] = useState(false);
	const [roomId, setRoomId] = useState('');
	const [searchGame, setSearchGame] = useState(false);
	const [modes, setModes] = useState(true);
	const [dataEndGame, setDataEndGame] = useState({
		win: false, score1: 0, score2: 0 
	})
	const [adversary, setAdversary] = useState<User>();

	const { user } = useUser();

	const handleGameStart = (roomName: string) => {
		setPlayGame(true);
		setRoomId(roomName);
		setEndGame(false);
	}

	const handleSetSearchGame = (value: boolean) => {
			setSearchGame(value);
	}

	const handleSetEndGame = (win: boolean, score1: number, score2: number, adversary: User)  => {
		setDataEndGame({win, score1, score2});
		setRoomId('');
		setPlayGame(false);
		setEndGame(true);
		setAdversary(adversary);
	}

	const handleCloseCardEndGame = () => {
		setEndGame(false);
		setSearchGame(false);
	}
	//return <Pong socket={socket} roomId={roomId} handleSetEndGame={handleSetEndGame} />
	//return <CardEndGame win={true} score1={10} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
	const pathAvatar : string = "http://localhost:3000/static/avatars/" + user.avatar;
	if (!playGame && !endGame)
	{
		return <>
			<div>
				<Checkbox defaultSelected onChange={() => setModes(!modes)}>Modes</Checkbox>
			</div>
			<Container>
				<Row justify='center'>
					<CardPlayerInformation searchGame={false} username={user.name} avatar={pathAvatar} elo={user.elo} nbWin={user.wins} nbLoose={user.losses} />
					<Spacer x={2} />
					<Text css={{ my:'auto' }} h1>VS</Text>
					<Spacer x={2} />
					<CardPlayerInformation searchGame={searchGame} username={"Adversary"} avatar="https://i.imgur.com/pLGJ0Oj.jpeg" elo={0} nbWin={0} nbLoose={0} />
				</Row>
			</Container>
			<Spacer y={2} />
			<ButtonStart searchGame={searchGame} modes={modes} handleGameStart={handleGameStart} handleSetSearchGame={handleSetSearchGame} />
		</>
	}
	else if (!playGame && endGame && adversary)
	{
		return <>
			<CardEndGame win={dataEndGame['win']} score1={dataEndGame['score1']} score2={dataEndGame['score2']} adversary={adversary} handleCloseCardEndGame={handleCloseCardEndGame} />
		</>
	}
	else if (playGame) {
		return <>
			<Pong roomId={roomId} handleSetEndGame={handleSetEndGame} />
		</>
	}
	else
		return <></>
}