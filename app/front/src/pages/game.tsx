import Head from 'next/head';
import GameBody from '../components/pong/GameBody'
import { Spacer } from '@nextui-org/react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/user.context';

export default function Game() {
    const router = useRouter();
    const { socket } = useUser();
    const [ roomName, setRoomName ] = useState('');

    useEffect(() => {
        const exitingFunction = () => {
            socket.emit('leaveGame', roomName);
        }
        router.events.on("routeChangeStart", exitingFunction);

        return () => {
            router.events.off("routeChangeStart", exitingFunction);
        };
    }, [roomName]);

    return (
        <>
            <Head>
                <title> Game </title>
            </Head>
            <div className="flex flex-col items-center">
                <Spacer y={3} />
                <div style={{width:'80%', maxWidth:'1000px'}}>
                    <GameBody roomName={roomName} setRoomName={setRoomName}/>
                </div>
            </div>
        </>
    );
}
