import Head from 'next/head';
import { Checkbox, Container, Loading, Row, Spacer, Text } from '@nextui-org/react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/user.context';
import Pong2 from '@/components/pong/Pong2';
import CardEndGame from '@/components/pong/CardEndGame';
import ButtonStart from '@/components/pong/ButtonStart';
import CardPlayerInformation from '@/components/pong/CardPlayerInformation';
import { PlayerEndGame } from '@/interfaces/pong.interface';

export default function Game() {
    const router = useRouter();
    const { user, socket } = useUser();
    const [ roomName, setRoomName ] = useState('');

    // from GameBody
    const [playGame, setPlayGame] = useState(false);
    const [endGame, setEndGame] = useState(false);
    const [who, setWho] = useState<number>(-1);
    const [searchGame, setSearchGame] = useState(false);
    const [modes, setModes] = useState(true);
    const [dataEndGame, setDataEndGame] = useState<PlayerEndGame>({} as PlayerEndGame);

    const pathAvatar : string = "http://localhost:3000/static/avatars/" + user.avatar;

    useEffect(() => {
        if (router.isReady) {
            if (!user.id) {
                router.push(`/?next=${router.asPath}`);
            }
            if (router.query && router.query.roomName && router.query.who) {
                handleStartGame(router.query.roomName, parseInt(router.query.who));
            }
        }
    }, [router]);

    const handleStartGame = (roomName: string, playerNumber: number) => {
        setRoomName(roomName);
        setWho(playerNumber);
        socket.emit("joinRoom", roomName);
        setPlayGame(true);
        setEndGame(false);
    }

    useEffect(() => {
        socket.on('searchGame', handleStartGame)
        return () => {
            socket.off('searchGame', handleStartGame);
        }
    }, [socket, roomName]);

    useEffect(() => {
        const exitingFunction = () => {
            socket.emit('leaveGame', roomName);
            socket.emit('cancelGame');
        }
        router.events.on("routeChangeStart", exitingFunction);

        return () => {
            router.events.off("routeChangeStart", exitingFunction);
        };
    }, [roomName]);

    const handleSetSearchGame = (value: boolean) => {
        setSearchGame(value);
    }

    const handleSetEndGame = (endGameData: PlayerEndGame)  => {
        socket.emit('leaveRoom', endGameData.room.name);
        setDataEndGame(endGameData);
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

    if (!user.id) return (<Loading/>);

    if (!playGame && !endGame) {
        return <>
            <Head>
                <title> Game </title>
            </Head>
            <div className="flex flex-col items-center">
                <Spacer y={3} />
                <div style={{width:'80%', maxWidth:'1000px'}}>
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
                </div>
            </div>
        </>
    } else if (!playGame && endGame) {
        return <>
            <Head>
                <title> Game </title>
            </Head>
            <div className="flex flex-col items-center">
                <Spacer y={3} />
                <div style={{width:'80%', maxWidth:'1000px'}}>
                    <CardEndGame endGame={dataEndGame} roomName={roomName} handleCloseCardEndGame={handleCloseCardEndGame} />
                </div>
            </div>
        </>
    } else if (playGame) {
        return <>
            <Head>
                <title> Game </title>
            </Head>
            <div className="flex flex-col items-center">
                <Spacer y={3} />
                <div style={{width:'80%', maxWidth:'1000px'}}>
                    <Pong2 roomName={roomName} who={who} handleSetEndGame={handleSetEndGame} />
                </div>
            </div>
        </>
    } else {
        return <></>
    }
}
