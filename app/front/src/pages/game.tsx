import Head from 'next/head';
import GamePage from '../components/pong/GamePage'

export default function Game() {
	return (
	<>
		<Head>
			<title> Game </title>
		</Head>
		<div className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Game</h1>
			<GamePage />
		</div>
	</>
	);
}
