import React from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';

const Chat: React.FC = () => {
	const socket = io('http://localhost:8001');

	return (
		<ChatBox socket={socket} />
	);
};

export default Chat;