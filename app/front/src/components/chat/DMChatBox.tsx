import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Message, MessageData, User } from "@/interfaces/chat.interfaces";
import { Container, Grid, Text, Textarea } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useUser } from '@/contexts/user.context';
import axios from "axios";
import { useChat } from "@/contexts/chat.context";

interface DMChatBoxProps {
    interlocutor: User;
}

const DMChatBox: React.FC<DMChatBoxProps> = ({ interlocutor }) => {
    const [missingPermissions, setMissingPermissions] = useState<boolean>(false); // Used to prevent the user from sending messages if they're not friends
    const [messages, setMessages] = useState<MessageData[]>([]);
    const { socket, user } = useUser();
    const {
        bannedChannels,
        setBannedChannels,
        mutedChannels,
        setMutedChannels,
        blockedUsers,
        setBlockedUsers,
    } = useChat();

    const fetchMessages = useCallback(async (interlocutor: User): Promise<MessageData[]> => {
        let data = await axios.get(`http://localhost:3000/dms/${interlocutor.id}/messages`,
            {
                withCredentials: true,
                validateStatus: () => true,
            }
        ).then((res) => { // Not friends for example
            if (res.status === 401) {
                setMissingPermissions(true);
                return [];
            } else if (res.status === 403) {
                return [];
            } else {
                setMissingPermissions(false);
            }
            return res.data;
        }).catch((err) => {
            throw Error("UNEXPECTED ERROR: " + err);
        })
        data.forEach((message: Message) => {
            message.timestamp = new Date(message.timestamp);
        });
        return data;
    }, []);

    useEffect(() => {
        socket.on('dmMessage', (payload: MessageData) => {
            // parse the timestamp
            payload.timestamp = new Date(payload.timestamp);
            setMessages((messages) => [payload, ...messages]);
        });
        socket.on('messageDeleted', (payload: MessageData) => {
            // find the message in the list and remove it
            setMessages((messages) => {
                const index = messages.findIndex((message) => message.message_id === payload.message_id);
                if (index !== -1) {
                    messages.splice(index, 1);
                }
                return [...messages];
            });
        });
        fetchMessages(interlocutor).then((messages) => {
            setMessages(messages);
        });
        return () => {
            socket.off('dmMessage');
            socket.off('messageDeleted');
        }
    }, [socket, user]);

    const handleNewMessage = useCallback((message: string) => {
        try {
            axios.post(`http://localhost:3000/dms/${interlocutor.id}/message`, { content: message }, { withCredentials: true })
        } catch (err) {
            throw Error("UNEXPECTED ERROR: " + err);
        }
    }, [user]);

    const memoizedMessages = useMemo(() => messages, [messages]);

    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                <Grid xs={12}>
                    <Grid.Container>
                        <Grid css={{ w: "stretch" }}>
                            <Container direction="row" justify="space-between" alignItems="center" display="flex">
                                <Text h3>{interlocutor.name}</Text>
                            </Container>
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
                                {memoizedMessages.map((message: MessageData, index: number) => (
                                    <li key={message.message_id} className="relative">
                                        <ChatMessage
                                            isAuthor={message.sender.id === user.id}
                                            blocked={blockedUsers.has(message.sender.id)}
                                            sender={message.sender}
                                            interlocutor={interlocutor}
                                            key={message.message_id}
                                            data={message}
                                            concatenate={
                                                index != memoizedMessages.length - 1
                                                && message.sender.id === memoizedMessages[index + 1].sender.id
                                                && message.timestamp.getTime() - memoizedMessages[index + 1].timestamp.getTime() < 5 * 60 * 1000
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </Grid>
                        <Grid xs={12}>
                            <Textarea
                                fullWidth
                                placeholder={`Send a message to ${interlocutor.name}`}
                                aria-label={`Send a message to ${interlocutor.name}`}
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

export default React.memo(DMChatBox);