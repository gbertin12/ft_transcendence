export interface User {
	id: number;
	name: string;
	avatar: string;
	wins: number;
	losses: number;
	elo: number;
}

export interface RowLeaderboard {
	rank: number;
	avatar: string;
	name: string;
	winrate: number;
	elo: number;
}