import Head from 'next/head';
import GameBody from '../components/pong/GameBody'
import { Loading, Spacer } from '@nextui-org/react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/user.context';

export default function Game() {
    const router = useRouter();
    const { user, socket } = useUser();
    const [ roomName, setRoomName ] = useState('');

    useEffect(() => {
        if (router.isReady) {
            if (!user.id) {
                router.push(`/?next=${router.asPath}`);
            }
        }
    }, [router]);

    useEffect(() => {
        const exitingFunction = () => {
            socket.emit('leaveGame', roomName);
        }
        router.events.on("routeChangeStart", exitingFunction);

        return () => {
            router.events.off("routeChangeStart", exitingFunction);
        };
    }, [roomName]);

    if (!user.id) return (<Loading/>);

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
