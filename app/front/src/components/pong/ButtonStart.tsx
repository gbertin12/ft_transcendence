import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react'
import { useUser } from '@/contexts/user.context';

export default function ButtonStart({ searchGame, modes, handleSetSearchGame }
    : { searchGame: boolean, modes: boolean, handleSetSearchGame: (value: boolean) => void }) {
    const { user, socket } = useUser();

    // Cancel Game
    function handleCancelGame() {
        if (socket) {
            socket.emit('cancelGame');
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

    if (searchGame === true) {
        return <>
            <Button css={{ mx: 'auto' }} onPress={handleCancelGame} color="error">Cancel Game</Button>
        </>
    } else {
        return <>
            <Button css={{ mx: 'auto' }} bordered onPress={handleSearchGame} color="success">Search Game</Button>
        </>
    }
}
