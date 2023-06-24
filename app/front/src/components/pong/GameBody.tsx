import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import Pong2 from './Pong2';
import {Container, Row, Spacer, Text, Checkbox, Col } from '@nextui-org/react'
import CardPlayerInformation from './CardPlayerInformation';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';
import { useUser } from '@/contexts/user.context';
import { PlayerEndGame } from '@/interfaces/pong.interface';
import { User } from '../../interfaces/user.interface'
import ButtonHintGame from './ButtonHintGame';
import ButtonModes from './ButtonModes';




export default function GameBody() {
    const [playGame, setPlayGame] = useState(false);
    const [endGame, setEndGame] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [who, setWho] = useState<number>(-1);
    const [searchGame, setSearchGame] = useState(false);
    const [modes, setModes] = useState(true);
    const [dataEndGame, setDataEndGame] = useState<PlayerEndGame>({} as PlayerEndGame);
    const [windowWidth, setWindowWidth] = useState<number>(0);

    const { user, socket } = useUser();

    const handleStartGame = (roomName: string, playerNumber: number) => {
        setRoomName(roomName);
        setWho(playerNumber);
        setPlayGame(true);
        setEndGame(false);
        if (window && window.innerWidth != 0)
            setWindowWidth(window.innerWidth);
    }

    useEffect(() => {
        socket.on('searchGame', handleStartGame)
        return () => {
            socket.off('searchGame', handleStartGame);
        }
    }, [socket, roomName]);

    const handleSetSearchGame = (value: boolean) => {
        if (window)
            setWindowWidth(window.innerWidth);
        setSearchGame(value);
    }

    const handleSetModes = (value: boolean) => {
        setModes(value);
    }
    const handleSetEndGame = (endGame: PlayerEndGame)  => {
        socket.emit('leaveRoom', endGame.room.name);
        setDataEndGame(endGame);
        //handleSetRoomName('');
        setPlayGame(false);
        setEndGame(true);
    }

    const handleCloseCardEndGame = () => {
        setEndGame(false);
        setWho(-1);
        setRoomName("");
        setSearchGame(false);
    }
    //return <Pong socket={socket} roomName={roomName} handleSetEndGame={handleSetEndGame} />
    //return <CardEndGame win={true} score1={10} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
    //return <Pong2 />
    const pathAvatar : string = "http://localhost:3000/static/avatars/" + user.avatar;
    //return <Pong2 windowWidth={windowWidth} roomName={roomName} who={who} handleSetEndGame={handleSetEndGame} />
    if (!playGame && !endGame)
    {
        return <>
            <Container>
                <Row justify='center'>
                    <Row justify='center'>
                        <CardPlayerInformation searchGame={false} username={user.name} avatar={pathAvatar} elo={user.elo} nbWin={user.wins} nbLoose={user.losses} />
                        <Spacer x={2} />
                        <Text css={{ my:'auto' }} h1>VS</Text>
                        <Spacer x={2} />
                        <CardPlayerInformation searchGame={searchGame} username={"Adversary"} avatar="https://i.imgur.com/pLGJ0Oj.jpeg" elo={0} nbWin={0} nbLoose={0} />
                    </Row>
                </Row>
            </Container>
            <Spacer y={2} />
            <Row justify='center' >
                <ButtonModes modes={modes} handleSetModes={handleSetModes} />
                <ButtonStart searchGame={searchGame} modes={modes} handleSetSearchGame={handleSetSearchGame} />
                <ButtonHintGame />
            </Row>
            <Spacer />
            
        </>
    }
    else if (!playGame && endGame)
    {
        return <>
            <CardEndGame endGame={dataEndGame} roomName={roomName} handleCloseCardEndGame={handleCloseCardEndGame} />
        </>
    }
    else if (playGame) {
        return <>
            <Pong2 windowWidth={windowWidth} roomName={roomName} who={who} handleSetEndGame={handleSetEndGame} />
        </>
    }
    else
        return <></>
}
