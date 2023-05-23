import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Channel, Message, User } from "@/interfaces/chat.interfaces";
import { Container, Grid, Text, Textarea } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useSocket } from '@/contexts/socket.context';
import { useUser } from '@/contexts/user.context';


const ChatBox: React.FC<any> = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel>();
    const { socket } = useSocket();
    const { user } = useUser();

    const fetchMessages = useCallback(async (channelId: number): Promise<Message[]> => {
        const url = `http://localhost:3000/channel/${channelId}/messages`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        return data;
    }, []);

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

    const memoizedMessages = useMemo(() => messages, [messages]);

    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                
                <Grid xs={6}>
                    <Grid.Container>
                        <Grid css={{w: "stretch"}}>
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
                
            </Grid.Container>
        </Container>
    );
};

export default React.memo(ChatBox);