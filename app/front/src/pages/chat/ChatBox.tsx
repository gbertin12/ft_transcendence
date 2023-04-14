import React, { useState } from "react";
import MessageInput from "../../components/chat/MessageInput";
import ChannelsBrowser from "../../components/chat/ChannelsBrowser";

interface Message {
	timestamp: number;
	content: string;
}

interface ChatBoxProps {
	privateMessages: string[];
	muted?: boolean | undefined;
}

const ChatBox: React.FC<ChatBoxProps> = ({ muted, privateMessages }) => {
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
		<div className="h-full">
			<div className="grid grid-cols-6 h-full">
				<ChannelsBrowser privateMessages={privateMessages} defaultSelectedIndex={0} />
				<div className="relative col-span-5 h-full overflow-hidden">
					<ul className="h-full overflow-y-auto">
						{messages.map((message) => (
							<li key={message.timestamp}>{message.timestamp} {message.content}</li>
						))}
					</ul>
					<MessageInput
						onSend={handleNewMessage}
						muted={muted}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatBox;
