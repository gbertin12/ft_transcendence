import Head from 'next/head';
import GamePage from '../components/pong/GamePage'
import { Text, Spacer, Container } from '@nextui-org/react'

export default function Game() {
	return (
	<>
		<Head>
			<title> Game </title>
		</Head>
		<div className="flex flex-col items-center">
			<Text h1>Pong Game</Text>
			<Spacer y={3} />
			<div style={{width:'80%', maxWidth:'700px'}}>
				<GamePage />
			</div>
		</div>
	</>
	);
}
