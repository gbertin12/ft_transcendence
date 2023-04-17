import React, { useEffect, useState } from "react";
import MessageInput from "../../components/chat/MessageInput";
import ChannelsBrowser from "../../components/chat/ChannelsBrowser";
import ChannelBar from "../../components/chat/ChannelBar";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import ChatMessage from "@/components/chat/ChatMessage";


interface ChatBoxProps {
	privateMessages: string[];
	muted?: boolean | undefined;
}

const ChatBox: React.FC<ChatBoxProps> = ({ muted, privateMessages }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setLoading] = useState(false);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<Channel>();
	const [isPrivateMessage, setIsPrivateMessage] = useState(false);

	// ghostMessages is used to display the message before it is sent to the server
	const [ghostMessages, setGhostMessage] = useState<string[]>([]);

	const fetchMessages = (channelId: number) => {
		fetch(`http://localhost:3001/channel/${channelId}/messages`)
		.then((res) => res.json())
		.then((data) => {
			setMessages(data);
		});
	};

	useEffect(() => {
		setLoading(true);
		fetch("http://localhost:3001/channel/all")
		.then((res) => res.json())
		.then((data) => {
			setChannels(data);
			setSelectedChannel(data[0]);
			fetchMessages(data[0].id);
			setLoading(false);
		}
		);
	}, []);

	const handleNewMessage = (message: string) => {
		// Add ghost message
		setGhostMessage([...ghostMessages, message]);

		// POST request to send the message to the server
		fetch(`http://localhost:3001/channel/${selectedChannel?.id}/message`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content: message }),
		})
		.then((res) => res.json())
		.then((data) => {
			// Remove ghost message
			setGhostMessage(ghostMessages.filter((msg) => msg !== message));
			// Prepend the message to the list
			setMessages([data, ...messages]);
		});
	};

	const handleChannelChange = (index: number) => {
		const newChannel = channels[index];
		setSelectedChannel(newChannel);
		setIsPrivateMessage(index >= channels.length);
		fetchMessages(newChannel.id);
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
						title={(isPrivateMessage ? "dm-default-placeholder" : selectedChannel?.name)}
						isPrivateMessage={isPrivateMessage}
						topic={selectedChannel?.topic}
					/>
					<ul className="h-full overflow-y-auto pb-28 flex flex-col-reverse">
						{ghostMessages.map((message, index) => (
							<ChatMessage
								key={-index}
								timestamp={new Date()}
								content={message}
								isGhost={true}
							/>
						))}
						{messages.map((message) => (
							<ChatMessage
								key={message.message_id}
								timestamp={message.timestamp}
								content={message.content}
							/>
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
