import React from "react";
import MessageInput from "./MessageInput";

const ChatBox: React.FC = () => {
	const handleNewMessage = (message: string) => {
		console.log("New message:", message);
	};

	return (
		<div>
		<h1>Chat Box</h1>
		<MessageInput onSubmit={handleNewMessage} />
		</div>
	);
};

export default ChatBox;
