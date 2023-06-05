import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Channel, Message, User } from "@/interfaces/chat.interfaces";
import { Button, Container, Grid, Input, Loading, Text, Textarea } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useUser } from '@/contexts/user.context';
import ChannelPasswordPrompt from "./ChannelPasswordPrompt";

interface ChatBoxProps {
    channel: Channel;
}

const ChatBox: React.FC<ChatBoxProps> = ({ channel }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasAccess, setHasAccess] = useState<boolean>(true);
    const { socket, user } = useUser();

    const fetchMessages = useCallback(async (channel: Channel): Promise<Message[]> => {
        const url = `http://localhost:3000/channel/${channel.id}/messages`;
        const res = await fetch(url, { credentials: "include" });
        // if we have a 403, it means we are not allowed to access this channel (password protected)
        if (res.status === 403) {
            setHasAccess(false);
            return [];
        }
        setHasAccess(true);
        const data = await res.json();
        return data;
    }, []);

    useEffect(() => {
        socket.emit('join', {
            channel: channel.id,
        });
        socket.on('message', (payload: Message) => {
            setMessages((messages) => [payload, ...messages]);
        });
        socket.on('joinChannel', (payload: any) => {
            fetchMessages(channel).then((messages) => {
                setMessages(messages);
            });
        });
        fetchMessages(channel).then((messages) => {
            setMessages(messages);
        });
        return () => {
            socket.off('message');
            socket.off('joinChannel');
        }
    }, [socket, channel]);

    const handleNewMessage = useCallback((message: string) => {
        // POST request to send the message to the server
        fetch(`http://localhost:3000/channel/${channel.id}/message`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: message }),
        })
    }, [channel]);

    const memoizedMessages = useMemo(() => messages, [messages]);

    // The user doesn't have access to this password protected channel, we need to ask for a password
    if (!hasAccess && channel.password === "") {
        return (
            <ChannelPasswordPrompt channel={channel} />
        );
    } else if (!hasAccess && !channel.password) { // The user doesn't have access to this channel and it's not password protected
        return ( // Throw a fake 404 message because it is a hidden channel
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-3xl font-bold">Salon inconnu</h1>
            </div>
        )
    }

    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                <Grid xs={6}>
                    <Grid.Container>
                        <Grid css={{ w: "stretch" }}>
                            <Text h3>{channel.name.replace(/^/, '# ')}</Text>
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
                                        />
                                    </li>
                                ))}
                            </ul>
                        </Grid>
                        <Grid xs={12}>
                            {hasAccess && (
                                <Textarea
                                    fullWidth
                                    placeholder="Entre ton message ici"
                                    aria-label="Champ de saisie du message"
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
                            )
                            }
                        </Grid>
                    </Grid.Container>
                </Grid>

            </Grid.Container>
        </Container>
    );
};

export default React.memo(ChatBox);