import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react'
import { useUser } from '@/contexts/user.context';

export default function ButtonStart({ searchGame, modes, handleGameStart, handleSetSearchGame }
    : { searchGame: boolean, modes: boolean, handleGameStart: (roomName: string) => void, handleSetSearchGame: (value: boolean) => void }) {
    const { socket } = useUser();

    // Cancel Game
    function handleCancelGame() {
        if (socket) {
            socket.emit('cancelGame', {
                clientId: socket.id
            });
            handleSetSearchGame(false);
        }
    }
    // Search game
    function handleSearchGame() {
        if (socket) {
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

    if (searchGame === true) {
        return <>
            <Button css={{ mx: 'auto' }} onClick={handleCancelGame} color="error">Cancel Game</Button>
        </>
    }
    else {
        return <>
            <Button css={{ mx: 'auto' }} bordered onClick={handleSearchGame} color="success">Search Game</Button>
        </>
    }
}
