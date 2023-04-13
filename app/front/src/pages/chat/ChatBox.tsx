import React, { useState } from "react";
import MessageInput from "./MessageInput";

interface Message {
	timestamp: number;
	content: string;
}

interface ChatBoxProps {
	muted?: boolean | undefined;
}

const ChatBox: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);

	const handleNewMessage = (message: string) => {
		const newMessage: Message = {
			timestamp: Date.now(),
			content: message,
		};
		// we cannot use push() because it mutates the array and React won't detect the change
		setMessages([...messages, newMessage]);
	};

	return (
		<div>
			<ul>
				{messages.map((message) => (
					<li key={message.timestamp}>{message.content}</li>
				))}
			</ul>
			<MessageInput
				onSend={handleNewMessage}
				muted={false}
			/>
		</div>
	);
};

export default ChatBox;
