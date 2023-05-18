import Head from 'next/head';
import Leaderboard from '../components/leaderboard/leaderboard'

export default function LeaderboardPage() {
	return (
		<>
			<Head>
				<title> Leaderboard </title>
			</Head>
			<Leaderboard />
		</>
	);
}
