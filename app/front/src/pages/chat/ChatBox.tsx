import React from "react";
import MessageInput from "./MessageInput";

const ChatBox: React.FC = () => {
	const handleNewMessage = (message: string) => {
		console.log("New message:", message);
	};

	return (
		<div>
			<MessageInput
				onNewMessage={handleNewMessage}
			/>
		</div>
	);
};

export default ChatBox;
