// interface de la ball

export interface BallData {
  	x: number;
  	y: number;
  	speedX: number;
  	speedY: number;
}

// interface du player
// player state : 0 = not in game, 1 = searching for game, 2 = in game, 3 = watching game
export interface PlayerInterface {
  	id: string;
  	state: number;
  	y: number;
  	score: number;
}

// interface du state
export interface PongState {
  	ball: BallData;
  	player1: PlayerInterface;
  	player2: PlayerInterface;
}
// room state : 0 = not started, 1 = started, 2 = finished
export interface roomInterface {
  	name: string;
  	state: number;
  	pongState: PongState;
}

export interface PowerInterface {
  	x: number;
  	y: number;
  	type: number;
  	time: number;
  	id: number;
}

export interface obstaclesInterface {
	x: number;
	y: number;
	size: number;
	id: number;
	isActive: number;
}
