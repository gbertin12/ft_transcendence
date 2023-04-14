import React, { useEffect, useState } from "react";
import MessageInput from "../../components/chat/MessageInput";
import ChannelsBrowser from "../../components/chat/ChannelsBrowser";
import ChannelBar from "../../components/chat/ChannelBar";

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
	const [isLoading, setLoading] = useState(false);
	const [channels, setChannels] = useState<any>(null);
	const [selectedChannel, setSelectedChannel] = useState<any>(null);
	const [isPrivateMessage, setIsPrivateMessage] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetch("http://localhost:3001/channel/all")
		.then((res) => res.json())
		.then((data) => {
			setChannels(data);
			setSelectedChannel(data[0]);
			setLoading(false);
		}
		);
	}, []);

	const handleNewMessage = (message: string) => {
		const newMessage: Message = {
			timestamp: Date.now(),
			content: message,
		};
		// we cannot use push() because it mutates the array and React won't detect the change
		setMessages([...messages, newMessage]);
	};

	const handleChannelChange = (index: number) => {
		const newChannel = channels[index];
		setSelectedChannel(newChannel);
		setIsPrivateMessage(index >= channels.length);
	};

	// TODO: Prettify this
	if (isLoading) { return <div>Loading...</div>; }

	return (
		<div className="h-full">
			<div className="grid grid-cols-6 h-full">
				<ChannelsBrowser
					onChange={handleChannelChange}
					channels={channels || []}
					privateMessages={privateMessages}
					defaultSelectedIndex={0}
				/>
				<div className="relative col-span-5 h-full overflow-hidden">
					<ChannelBar	
						title={(isPrivateMessage ? "dm-default-placeholder" : selectedChannel?.title)}
						isPrivateMessage={isPrivateMessage}
						topic={selectedChannel?.topic}
					/>
					<ul className="h-full overflow-y-auto	">
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
