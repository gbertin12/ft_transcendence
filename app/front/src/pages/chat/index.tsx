import React, { useEffect, useState } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';

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

const Chat: React.FC = () => {
	const socket = useSocket('http://localhost:8001');

	return (
		<ChatBox socket={socket} />
	);
};

export default Chat;