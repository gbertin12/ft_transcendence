import React, { useEffect, useState } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import io from 'socket.io-client';
import { Avatar, Container, Grid, Loading, Text, Textarea } from "@nextui-org/react";
import Chats from "@/components/chat/ChatFriendBrowser";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatFriendBrowser from "@/components/chat/ChatFriendBrowser";
import ChatChannelBrowser from "@/components/chat/ChatChannelBrowser";


interface ChatBoxProps {
    
}

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

const ChatBox: React.FC<ChatBoxProps> = ({ }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel>();

    // ghostMessages is used to display the message before it is sent to the server
    const [ghostMessages, setGhostMessage] = useState<string[]>([]);

    // Workaround to not re-create the socket on every render
    const socket = useSocket('http://localhost:8001');

    const fetchMessages = (channelId: number) => {
        fetch(`http://localhost:3001/channel/${channelId}/messages`)
            .then((res) => res.json())
            .then((data) => {
                setMessages(data);
            });
    };

    useEffect(() => {
        fetch("http://localhost:3001/channel/all")
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
                setSelectedChannel(data[0]);
                setLoading(false);
            });

        // Listen for new messages
        if (socket) {
            socket.on('message', (payload: any) => {
                setMessages((messages) => [payload.message, ...messages]);
            });
        }
    }, [socket]);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id);
            socket.emit('join', {
                channel: selectedChannel.id,
            });
        }
    }, [selectedChannel]);


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
        }) // TODO: check that API sent a 200
            .then((res) => res.json())
            .then((data) => {
                // Remove ghost message
                setGhostMessage(ghostMessages.filter((msg) => msg !== message));
                // Emit message to the server using socket.io
                socket.emit('message', {
                    message: data,
                });
            });
    };

    const handleChannelChange = (channel: Channel) => {
        setSelectedChannel(channel);
        fetchMessages(channel.id);
    };

    if (isLoading) {
        return (
            <Container>
                <Grid.Container gap={2} justify="center" css={{ height: "100vh" }}>
                    <Grid xs={3} direction="column">
                        <Text h3>Chats</Text>
                        <hr />
                        <Loading size="xl" css={{ mx: "auto" }} />
                    </Grid>
                    <Grid xs={6} direction="column">
                        <Text h3>Current Chat</Text>
                        <Loading size="xl" css={{ mx: "auto" }} />
                    </Grid>
                    <Grid xs={3} direction="column">
                        <Grid>
                            <Text h3 css={{ mx: "auto" }}>Friends</Text>
                            <Loading size="xl" css={{ mx: "auto" }} />
                        </Grid>
                    </Grid>
                </Grid.Container>
            </Container>
        );
    }
    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{ height: "100vh" }}>
                <Grid xs={3} direction="column">
                    <Text h3>Chats</Text>
                    <hr />
                    {/* TODO: Display latest chats with friends */}
                    <ChatChannelBrowser
                        channels={channels}
                        channelChanged={handleChannelChange}
                    />
                </Grid>
                <Grid xs={6}>
                    <Grid.Container>
                        <Grid>
                            <Text h3 css={{ mx: "auto" }}># {selectedChannel?.name}</Text>
                            <ul
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    overflowY: "auto",
                                    height: "80vh",
                                    display: "flex",
                                    flexDirection: "column-reverse",
                                }}
                            >
                                {messages.map((message) => (
                                    <li key={message.message_id}>
                                        <ChatMessage
                                            content={message.content}
                                            senderId={message.sender_id}
                                            userId={1}
                                        />
                                    </li>
                                ))}
                                {/* {ghostMessages.map((message) => (
                                    <li key={message}>
                                        <ChatMessage
                                            content={message}
                                            senderId={1}
                                            userId={1}
                                            ghost
                                        />
                                    </li>
                                ))} */}
                            </ul>
                        </Grid>
                        <Grid xs={12}>
                            <Textarea
                                placeholder="Entre ton message ici"
                                fullWidth
                                minLength={1}
                                maxLength={2000}
                                onKeyPress={(e: any) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        let message: string = e.target.value;
                                        message = message.trim();
                                        if (message.length > 0) {
                                            handleNewMessage(message);
                                            e.target.value = "";
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid.Container>
                </Grid>
                <Grid xs={3} direction="column">
                    <Text h3>Friends</Text>
                    <hr />
                    <ChatFriendBrowser />
                </Grid>
            </Grid.Container>
        </Container>
    );
};

export default ChatBox;
