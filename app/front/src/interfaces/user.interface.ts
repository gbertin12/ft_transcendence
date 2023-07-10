export interface User {
    id: number;
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    elo: number;
    otp: boolean;
}

export interface RowLeaderboard {
    rank: number;
    user: User;
    winrate: number;
}
