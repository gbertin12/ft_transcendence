import io, { Socket } from 'socket.io-client';
import React, { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import { Container, Grid, Loading, Text, Textarea } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatFriendBrowser from "@/components/chat/ChatFriendBrowser";
import ChatChannelBrowser from "@/components/chat/ChatChannelBrowser";
import ChannelCreateIcon from "@/components/chat/icons/ChannelCreateIcon";
import FriendList from './FriendList';

interface ChatBoxProps {
    socket: Socket;
}

const ChatBox: React.FC<ChatBoxProps> = ({ socket }: {socket: Socket} ) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel>(0);
    const [user, setUser] = useState<any>();

    const fetchMessages = useCallback(async (channelId: number): Promise<Message[]> => {
        const url = `http://localhost:3000/channel/${channelId}/messages`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        return data;
    }, []);

    useEffect(() => {
        fetch("http://localhost:3000/user/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
            });
        fetch("http://localhost:3000/channel/all", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
                setSelectedChannel(data[0]);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Listen for new messages
        if (socket) {
            socket.on('message', (payload: any) => {
                setMessages((messages) => [payload.message, ...messages]);
            });
            socket.on('newChannel', (payload: any) => {
                setChannels((channels) => [...channels, payload.channel]);
            });
            socket.on('deleteChannel', (payload: any) => {
                setChannels((channels) => channels.filter((c) => c.id !== payload.channel.id));
                if (selectedChannel?.id === payload.channel.id) {
                    setSelectedChannel(channels[0]);
                }
            });
            socket.on('editChannel', (payload: any) => {
                setChannels((channels) => channels.map((c) => c.id === payload.channel.id ? payload.channel : c));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id).then((data) => {
                setMessages(data);
            });
            socket.emit('join', {
                channel: selectedChannel.id,
            });
        }
    }, [selectedChannel, fetchMessages, socket]);

    const handleNewMessage = useCallback((message: string) => {
        // POST request to send the message to the server
        fetch(`http://localhost:3000/channel/${selectedChannel?.id}/message`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: message }),
        })
    }, [selectedChannel]);

    const handleChannelChange = useCallback((channel: Channel) => {
        setSelectedChannel(channel);
        socket.emit('join', {
            channel: selectedChannel.id,
        });
    }, []);

    const memoizedMessages = useMemo(() => messages, [messages]);

    if (isLoading) {
        return (
            <Container>
                <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                    <Grid xs={3} direction="column">
                        <Text h3>Chats</Text>
                        <hr />
                        <Loading size="xl" css={{ mx: "auto" }} />
                    </Grid>
                    <Grid xs={6} direction="column">
                        <Text h3></Text>
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
            <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                <Grid xs={3} direction="column">
                    <Text h3>Chats</Text>
                    <hr />
                    <Grid.Container>
                        <Grid xs={10}>
                            <Text h4>Salons</Text>
                        </Grid>
                        <ChannelCreateIcon />
                    </Grid.Container>

                    {/* TODO: Display latest chats with friends */}
                    <ChatChannelBrowser
                        channels={channels}
                        channelChanged={handleChannelChange}
                    />
                </Grid>
                <Grid xs={6}>
                    <Grid.Container>
                        <Grid>
                            <Text h3>{selectedChannel?.name.replace(/^/, '# ')}</Text>
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
                                {memoizedMessages.map((message) => (
                                    <li key={message.message_id}>
                                        <ChatMessage
                                            content={message.content}
                                            senderId={message.sender_id}
                                            userId={user?.id}
                                        />
                                    </li>
                                ))}
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
                    <FriendList />
                </Grid>
            </Grid.Container>
        </Container>
    );
};

export default React.memo(ChatBox);