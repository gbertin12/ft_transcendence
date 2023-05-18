import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import GameBody from './GameBody';
import CardEndGame from './CardEndGame';
import Image from 'next/image';

function useSocket(url: string) {
    const [socket, setSocket] = useState<any>();
    useEffect(() => {
        const socketIo = io(url, { withCredentials: true });
        setSocket(socketIo);
        function cleanup() {
            socketIo.disconnect()
        }
        return cleanup
    }, [])
    return socket
}

export default function GamePage() {
	
	const socket = useSocket('http://localhost:8001');
	  return (
	<>
		<div>
			<GameBody socket={socket} />
		</div>
	</>
  )
}
