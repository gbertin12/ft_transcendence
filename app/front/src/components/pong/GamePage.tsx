import Pong from './Pong'
import io, { Socket } from 'socket.io-client';
import { useState, useEffect } from 'react';
import GameBody from './GameBody';
import Image from 'next/image';

function useSocket(url: string) {
	const [socket, setSocket] = useState<any>();
	useEffect(() => {

		const socketIo = io(url);
		setSocket(socketIo);
		function cleanup() {
			socketIo.disconnect()
		}
		return cleanup
	}, [])
	return socket
}

export default function GamePage() {
	
	const socket = useSocket('http://10.12.1.5:8001');
	  return (
	<>
		<GameBody socket={socket} />
	</>
  )
}