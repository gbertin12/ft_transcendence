import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import {Container, Row, Spacer, Text, Checkbox } from '@nextui-org/react'
import CardPlayerInformation from './CardPlayerInformation';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';
import { useUser } from '@/contexts/user.context';
import { PlayerEndGame } from '@/interfaces/pong.interface';

export default function GameBody({ roomName, handleSetRoomName }: { roomName: string, handleSetRoomName: (name: string) => void}) {
    const [playGame, setPlayGame] = useState(false);
    const [endGame, setEndGame] = useState(false);
    const [who, setWho] = useState<number>(-1);
    const [searchGame, setSearchGame] = useState(false);
    const [modes, setModes] = useState(true);
    const [dataEndGame, setDataEndGame] = useState<PlayerEndGame>({} as PlayerEndGame);

    const { user, socket } = useUser();

    const handleStartGame = () => {
        
    }

    useEffect(() => {
        socket.on('startGame', handleStartGame);
        return () => {
            socket.off('startGame', handleStartGame);
        }
    }, [socket, roomName]);

    const handleGameStart = (roomName: string, who : number) => {
        setPlayGame(true);
        handleSetRoomName(roomName);
        setWho(who);
        
        setEndGame(false);
    }

    const handleSetSearchGame = (value: boolean) => {
        setSearchGame(value);
        socket.emit("joinRoom", roomName);
    }

    const handleSetEndGame = (endGame: PlayerEndGame)  => {
        setDataEndGame(endGame);
        //handleSetRoomName('');
        setPlayGame(false);
        setEndGame(true);
    }

    const handleCloseCardEndGame = () => {
        setEndGame(false);
        setWho(-1);
        handleSetRoomName("");
        setSearchGame(false);

    }
    //return <Pong socket={socket} roomName={roomName} handleSetEndGame={handleSetEndGame} />
    //return <CardEndGame win={true} score1={10} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
    const pathAvatar : string = "http://bess-f1r2s10:3000/static/avatars/" + user.avatar;
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
    else if (!playGame && endGame)
    {
        return <>
            <CardEndGame endGame={dataEndGame} roomName={roomName} handleCloseCardEndGame={handleCloseCardEndGame} />
        </>
    }
    else if (playGame) {
        return <>
            <Pong roomName={roomName} who={who} handleSetEndGame={handleSetEndGame} />
        </>
    }
    else
    return <></>
}
