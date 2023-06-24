import React, { useState, useEffect } from 'react';
import Pong from './Pong'
import Pong2 from './Pong2';
import {Container, Row, Spacer, Text, Checkbox } from '@nextui-org/react'
import CardPlayerInformation from './CardPlayerInformation';
import ButtonStart  from './ButtonStart'
import CardEndGame from './CardEndGame';
import { useUser } from '@/contexts/user.context';
import { PlayerEndGame } from '@/interfaces/pong.interface';

export default function GameBody({ roomName, setRoomName }: { roomName: string, setRoomName: (name: string) => void}) {

    //return <Pong socket={socket} roomName={roomName} handleSetEndGame={handleSetEndGame} />
    //return <CardEndGame win={true} score1={10} score2={3} handleCloseCardEndGame={handleCloseCardEndGame} />
    //return <Pong2 />

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
            <ButtonStart searchGame={searchGame} modes={modes} handleSetSearchGame={handleSetSearchGame} />
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
            <Pong2 roomName={roomName} who={who} handleSetEndGame={handleSetEndGame} />
        </>
    }
    else
    return <></>
}
}
