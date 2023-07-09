import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Channel, ChannelStaff, Message, MessageData, PunishmentData, User } from "@/interfaces/chat.interfaces";
import { Button, Container, Grid, Text, Textarea, Tooltip } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useUser } from '@/contexts/user.context';
import ChannelPasswordPrompt from "./ChannelPasswordPrompt";
import axios from "axios";
import { useChat } from "@/contexts/chat.context";
import { IconDoorExit, IconShieldCog } from "@tabler/icons-react";
import ChannelSettings from "./settings/ChannelSettingsModal";

interface ChatBoxProps {
    channel: Channel;
}

interface StaffUpdate {
    channel_id: number;
    user_id: number;
}

function generateMutedMessage(talkPowerTimer: number): string {
    if (talkPowerTimer < 0 || talkPowerTimer > 31536000 * 5) { // Negative or 5 years
        return "You are muted.";
    } else {
        const hours = Math.floor(talkPowerTimer / 3600);
        const minutes = Math.floor((talkPowerTimer % 3600) / 60);
        const seconds = Math.floor(talkPowerTimer % 60);
        return `You are muted for ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

const ChatBox: React.FC<ChatBoxProps> = ({ channel }) => {
    const [missingPermissions, setMissingPermissions] = useState<boolean>(false);
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [ownerId, setOwnerId] = useState<number>(-1);
    const [admins, setAdmins] = useState<Set<number>>(new Set<number>());
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [endOfHistory, setEndOfHistory] = useState<boolean>(false);
    const [channelSettingsOpen, setChannelSettingsOpen] = useState<boolean>(false);

    const { socket, user } = useUser();
    const {
        bannedChannels,
        mutedChannels,
        blockedUsers,
        setSelectedChannel,
        setChannels,
    } = useChat();

    useEffect(() => {
        setSelectedChannel(channel);
        return () => {
            setSelectedChannel(null);
        }
    }, [channel]);

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
                fetchHistory(channel, lastMessageId).then((history) => {
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

    const fetchMessages = useCallback(async (channel: Channel): Promise<MessageData[]> => {
        let data = await axios.get(`http://localhost:3000/channel/${channel.id}/messages`,
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

    const fetchHistory = useCallback(async (channel: Channel, lastMessageId: number): Promise<MessageData[]> => {
        let data = await axios.get(`http://localhost:3000/channel/${channel.id}/history/${lastMessageId}`,
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
            throw Error("UNEXPECTED ERROR: " + err);
        })
        data.forEach((message: Message) => {
            message.timestamp = new Date(message.timestamp);
        });
        setLoadingHistory(false);
        return data.reverse();
    }, []);

    useEffect(() => {
        socket.emit('join', channel.id);
        socket.on("addStaff", (data: StaffUpdate) => {
            if (data.channel_id === channel.id) {
                setAdmins((admins) => {
                    const newAdmins = new Set(admins);
                    newAdmins.add(data.user_id);
                    return newAdmins;
                });
            }
        });
        socket.on("removeStaff", (data: StaffUpdate) => {
            if (data.channel_id === channel.id) {
                setAdmins((admins) => {
                    const newAdmins = new Set(admins);
                    newAdmins.delete(data.user_id);
                    return newAdmins;
                });
            }
        });
        socket.on('message', (payload: MessageData) => {
            // parse the timestamp
            payload.timestamp = new Date(payload.timestamp);
            setMessages((messages) => [payload, ...messages]);
        });
        socket.on('deleteMessage', (payload: MessageData) => {
            // find the message in the list and remove it
            setMessages((messages) => {
                const index = messages.findIndex((message) => message.message_id === payload.message_id);
                if (index !== -1) {
                    messages.splice(index, 1);
                }
                return [...messages];
            });
        });
        socket.on('staff', (staff: ChannelStaff) => {
            setOwnerId(staff.owner_id);
            setAdmins(new Set(staff.administrators));
        });
        socket.on('leaveChannel', (channelId: number) => {
            // remove the channel from the list of channels
            setChannels((channels) => {
                const index = channels.findIndex((channel) => channel.id === channelId);
                if (index !== -1) {
                    channels.splice(index, 1);
                }
                return [...channels];
            });
            socket.emit('leave', channelId);
        });
        fetchMessages(channel).then((messages) => {
            setMessages(messages);
        });
        return () => {
            socket.off('message');
            socket.off('staff');
            socket.off('addStaff');
            socket.off('removeStaff');
            socket.off('deleteMessage');
            socket.emit('leave', channel.id);
        }
    }, [socket, channel, fetchMessages, setChannels]);

    const handleNewMessage = useCallback((message: string) => {
        try {
            axios.post(`http://localhost:3000/channel/${channel.id}/message`, { content: message }, { withCredentials: true })
        } catch (err) {
            throw Error("UNEXPECTED ERROR: " + err);
        }
    }, [channel]);

    const memoizedMessages = useMemo(() => messages, [messages]);

    // The user is banned
    if (bannedChannels.has(channel.id)) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-3xl font-bold">You are banned from this channel</h1>
            </div>
        )
    }

    // The user doesn't have access to this password protected channel, we need to ask for a password
    if (missingPermissions && channel.password === "") {
        return (
            <ChannelPasswordPrompt channel={channel} />
        );
    } else if (missingPermissions && !channel.password) { // The user doesn't have access to this channel and it's not password protected
        return ( // Throw a fake 404 message because it is a hidden channel
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-3xl font-bold">Unknown room</h1>
            </div>
        )
    }

    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{ height: "90vh" }}>
                <Grid xs={12}>
                    <Grid.Container>
                        <Grid css={{ w: "stretch" }}>
                            <Container direction="row" display="flex">
                                <Text h3>{channel.name.replace(/^/, '# ')}</Text>
                                <Container justify="flex-end" alignItems="center" display="flex" css={{ flex: 1 }}>
                                    {channel.private && (
                                        <Tooltip content={`Leave channel ${channel.owner_id === user.id ? "(transfer ownership first)" : ""}`} color="error">
                                            <Button
                                                auto
                                                light
                                                disabled={channel.owner_id === user.id}
                                                onPress={() => {
                                                    axios.put(`http://localhost:3000/channel/${channel.id}/leave`, {},
                                                        {
                                                            withCredentials: true,
                                                            validateStatus: () => true,
                                                        }
                                                    )
                                                }}>
                                                <IconDoorExit />
                                            </Button>
                                        </Tooltip>
                                    )}
                                    {/* Hide if not admin / owner */}
                                    {(channel.owner_id == user.id || admins.has(user.id)) && (
                                        <Tooltip content="Channel settings" color="warning">
                                            <Button auto light onPress={() => {
                                                setChannelSettingsOpen(true);
                                            }}>
                                                <IconShieldCog />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </Container>
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
                                            senderOwner={message.sender.id === ownerId}
                                            senderAdmin={admins.has(message.sender.id)}
                                            isOwner={user.id === ownerId}
                                            isAdmin={admins.has(user.id)}
                                            isAuthor={message.sender.id === user.id}
                                            blocked={blockedUsers.has(message.sender.id)}
                                            sender={message.sender}
                                            channel={channel}
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
                            {(!missingPermissions && !bannedChannels.has(channel.id)) && (
                                <Textarea
                                    fullWidth
                                    disabled={mutedChannels.has(channel.id)}
                                    placeholder={
                                        !mutedChannels.has(channel.id) ? `Send a message to #${channel.name}`
                                            :
                                            generateMutedMessage(Infinity)
                                    }
                                    aria-label={
                                        !mutedChannels.has(channel.id) ? `Send a message to the channel : ${channel.name}`
                                            :
                                            generateMutedMessage(Infinity)
                                    }
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
            <ChannelSettings
                channel={channel}
                open={channelSettingsOpen}
                onClose={() => setChannelSettingsOpen(false)}
            />
        </Container>
    );
};

export default React.memo(ChatBox);
