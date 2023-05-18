import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react'
import io, { Socket } from 'socket.io-client';

export default function ButtonStart({searchGame, socket, modes, handleGameStart, handleSetSearchGame} : {searchGame:boolean, socket: Socket, modes: boolean, handleGameStart: (roomName:string) => void, handleSetSearchGame: (value: boolean) => void}) {
	// Cancel Game
	function handleCancelGame() {
		if (socket)
		{
			socket.emit('cancelGame', {
				clientId: socket.id
			});
			handleSetSearchGame(false);
		}
	}
	// Search game
	function handleSearchGame() {
		if (socket)
		{
			socket.emit('searchGame', {
				clientId: socket.id,
				modes: modes
			});
			handleSetSearchGame(true);
		}
	}

	useEffect(() => {
			socket?.on('searchGame', handleGameStart)
			return () => {
				socket?.off('searchGame', handleGameStart);
			}
	}, [handleGameStart]);
	
	if (searchGame === true)
	{
		return <>
			<Button css={{ mx:'auto' }} onClick={handleCancelGame} color="error">Cancel Game</Button>
		</>
	}
	else
	{
		return <>
			<Button css={{ mx:'auto' }} bordered onClick={handleSearchGame} color="success">Search Game</Button>
		</>
	}
}