import React from 'react';

export default function CardEndGame({win, score1, score2, handleCloseCardEndGame} : {win: boolean, score1: number, score2: number, handleCloseCardEndGame: () => void}) {


	return <>
			<div>
				<h1>YOU { win ? "WIN !" : "LOOSE !"}</h1>
				<h3>Score :</h3>
				<div>
					<div>{score1}</div>
					<div>{score2}</div>
				</div>
				<button onClick={handleCloseCardEndGame}>Close</button>
		</div>
	</>
}