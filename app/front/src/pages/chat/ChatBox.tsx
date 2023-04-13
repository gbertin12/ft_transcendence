import React from "react";
import MessageInput from "./MessageInput";

const ChatBox: React.FC = () => {
	const handleNewMessage = (message: string) => {
		console.log("New message:", message);
	};

	return (
		<div>
			<MessageInput
				onSend={handleNewMessage}
			/>
		</div>
	);
};

export default ChatBox;
