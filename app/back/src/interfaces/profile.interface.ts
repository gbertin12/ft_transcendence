export interface MatchHistoryRow {
    id:             number;
    victory:        boolean;
    winnerScore:    number;
    looserScore:    number;
    opponentName:   string;
    avatar:         string;
    elo:            number;
}

export interface GameData {
    id:             number;
    winnerId:       number;
    looserId:       number;
    winnerScore:    number;
    looserScore:    number;
    date:           string;
    elo:            number;
    opponent:       Opponent;
}

export interface Opponent {
    name:       string;
    avatar:     string;
    elo:        number;
}
