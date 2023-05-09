import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function ButtonStart({socket, playGame, handleGameStart} : {socket: Socket, playGame: boolean, handleGameStart: (roomName:string) => void}) {
	const [searchGame, setSearchGame] = useState(false);
	// Cancel Game
	function handleCancelGame() {
		if (socket)
		{
			socket.emit('cancelGame', {
				clientId: socket.id
			});
			setSearchGame(false);
		}
	}
	// Search game
	function handleSearchGame() {
		if (socket)
		{
			socket.emit('searchGame', {
				clientId: socket.id
			});
			setSearchGame(true);
		}
	}

	useEffect(() => {
			socket?.on('searchGame', handleGameStart)
			return () => {
				socket?.off('searchGame', handleGameStart);
			}
	}, [handleGameStart]);
	
	return <>
		{ searchGame === true ? (
		<button onClick={handleCancelGame}>Cancel Game</button>
	) : (
		<button onClick={handleSearchGame}>Search Game</button>
	)}
	</>
}