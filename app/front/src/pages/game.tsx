import Head from 'next/head';
import GamePage from '../components/pong/GamePage'
import { Text, Spacer } from '@nextui-org/react'

export default function Game() {
	return (
	<>
		<Head>
			<title> Game </title>
		</Head>
		<div className="flex flex-col items-center">
			<Text h1>Pong Game</Text>
			<Spacer y={3} />
			<GamePage />
		</div>
	</>
	);
}
