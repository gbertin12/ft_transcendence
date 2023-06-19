import Head from 'next/head';
import GameBody from '../components/pong/GameBody'
import { Text, Spacer } from '@nextui-org/react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/user.context';

export default function Game() {
    const router = useRouter();
    const { socket } = useUser();

    return (
        <>
            <Head>
                <title> Game </title>
            </Head>
            <div className="flex flex-col items-center">
            <Text h1>Pong Game</Text>
                <Spacer y={3} />
                <div style={{width:'80%', maxWidth:'1000px'}}>
                    <GameBody />
                </div>
            </div>
        </>
    );
}
