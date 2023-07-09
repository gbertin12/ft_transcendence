import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [endOfHistory, setEndOfHistory] = useState<boolean>(false);
    const { socket, user } = useUser();
    const {
        blockedUsers, friends, setFriends
    } = useChat();
    const messagesRef = useRef<HTMLUListElement>(null);

    function handleScroll() {
        if (messagesRef.current) {
            // Get height of the scrollable area
            const posY = Math.abs(messagesRef.current.scrollTop);
            const height = messagesRef.current.clientHeight;
            if (posY / height > 0.10 && !loadingHistory && !endOfHistory) { // If we are 70% of the way up the <ul> load more messages
                setLoadingHistory(true);
                // Get the last message id
                const lastMessageId = messages[messages.length - 1].message_id;
                fetchHistory(interlocutor, lastMessageId).then((history) => {
                    // preappend the messages to the list the messages that are not already in the list
                    setMessages((messages) => {
                        const newMessages = history.filter((message) => !messages.some((m) => m.message_id === message.message_id)).reverse();
                        if (newMessages.length < 50) {
                            setEndOfHistory(true);
                        }
                        return [...messages, ...newMessages];
                    });
                });
            }
        }
    }

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
        })
        data.forEach((message: Message) => {
            message.timestamp = new Date(message.timestamp);
        });
        return data;
    }, []);

    const fetchHistory = useCallback(async (interlocutor: User, lastMessageId: number): Promise<MessageData[]> => {
        let data = await axios.get(`http://localhost:3000/dms/${interlocutor.id}/history/${lastMessageId}`,
            {
                withCredentials: true,
                validateStatus: () => true,
            }
        ).then((res) => {
            if (res.status === 401) {
                setMissingPermissions(true);
                return [];
            } else if (res.status === 403) {
                return [];
            } else if (res.status === 404) {
                return [];
            } else {
                setMissingPermissions(false);
            }
            return res.data;
        }).catch((err) => {
        })
        data.forEach((message: Message) => {
            message.timestamp = new Date(message.timestamp);
        });
        setLoadingHistory(false);
        return data.reverse();
    }, []);

    const handleNewMessage = useCallback(async (message: MessageData): Promise<void> => {
        // parse the timestamp
        message.timestamp = new Date(message.timestamp);
        setMessages((messages) => [message, ...messages]);
    }, []);

    useEffect(() => {
        socket.on('dmMessage', handleNewMessage);
        socket.on('messageDeleted', (message_id: number) => {
            // find the message in the list and remove it
            setMessages((messages) => {
                const index = messages.findIndex((message) => message.message_id === message_id);
                if (index !== -1) {
                    messages.splice(index, 1);
                }
                return [...messages];
            });
        });
        fetchMessages(interlocutor).then((messages) => {
            setMessages(messages);
        });
        // reset unread messages
        setFriends((friends) => {
            const index = friends.findIndex((friend) => friend.user.id === interlocutor.id);
            if (index !== -1) {
                friends[index].unreadMessages = 0;
            }
            return [...friends];
        });
        return () => {
            socket.off('dmMessage', handleNewMessage);
            socket.off('messageDeleted');
        }
    }, [socket, user, fetchMessages, interlocutor, setFriends, handleNewMessage]);

    const handlePostMessage = useCallback((message: string) => {
        try {
            axios.post(`http://localhost:3000/dms/${interlocutor.id}/message`, { content: message }, { withCredentials: true })
        } catch (err) {
        }
    }, [user, interlocutor.id]);

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
                                ref={messagesRef}
                                onScroll={handleScroll}
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
                                            handlePostMessage(message);
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
