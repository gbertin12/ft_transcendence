export interface MatchHistoryRow {
    id:             number;
    victory:        boolean;
    winnerScore:    number;
    looserScore:    number;
    opponentName:   string;
    avatar:         string;
    elo:            number;
    eloOpponent:    number;
    date:           string;
    mode:           boolean;
}

export interface GameData {
    id:             number;
    winnerId:       number;
    looserId:       number;
    winnerScore:    number;
    looserScore:    number;
    date:           string;
    winnerElo:      number;
    looserElo:      number;
    mode:           boolean;
    opponent:       Opponent;
}

export interface Opponent {
    name:       string;
    avatar:     string;
    elo:        number;
}

export interface Elo {
    general:    number;
    player:     number;
    date:       string;
    amt:        number;
}
