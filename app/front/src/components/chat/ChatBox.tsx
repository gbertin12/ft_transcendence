import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Channel, ChannelStaff, Message, MessageData, PunishmentData, User } from "@/interfaces/chat.interfaces";
import { Button, Container, Grid, Text, Textarea } from "@nextui-org/react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useUser } from '@/contexts/user.context';
import ChannelPasswordPrompt from "./ChannelPasswordPrompt";
import axios from "axios";
import { useChat } from "@/contexts/chat.context";
import { IconShieldCog } from "@tabler/icons-react";
import PowerModal from "./powertools/PowerModal";

interface ChatBoxProps {
    channel: Channel;
}

interface MutePunishment {
    active: boolean;  // true = muted, false = not muted
    duration: number; // number of seconds left before we can talk again (negative if we are permanently muted)
    interval: NodeJS.Timeout | null;
}

function generateMutedMessage(talkPowerTimer: number): string {
    if (talkPowerTimer < 0 || talkPowerTimer > 31536000 * 5) { // Negative or 5 years
        return "You are permanently muted.";
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
    const [powerModalOpen, setPowerModalOpen] = useState<boolean>(false);
    const [ownerId, setOwnerId] = useState<number>(-1);
    const [admins, setAdmins] = useState<Set<number>>(new Set<number>());
    const { socket, user } = useUser();
    const { bannedChannels, setBannedChannels, mutedChannels, setMutedChannels } = useChat();

    const fetchMessages = useCallback(async (channel: Channel): Promise<MessageData[]> => {
        let data = await axios.get(`http://bess-f1r2s10:3000/channel/${channel.id}/messages`,
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

    useEffect(() => {
        socket.emit('join', channel.id);
        socket.on('message', (payload: MessageData) => {
            // parse the timestamp
            payload.timestamp = new Date(payload.timestamp);
            setMessages((messages) => [payload, ...messages]);
        });
        socket.on('joinChannel', (payload: any) => {
            fetchMessages(channel).then((messages) => {
                setMessages(messages);
            });
        });
        socket.on('staff', (staff: ChannelStaff) => {
            setOwnerId(staff.owner_id);
            setAdmins(new Set(staff.administrators));
        });
        socket.on("punishment", (punishment: PunishmentData) => {
            // TODO: handle the punishment
            switch (punishment.punishment_type) {
                case "muted":
                    setMutedChannels((mutedChannels) => {
                        return new Set(mutedChannels).add(punishment.channel_id);
                    });
                    break;
                case "banned":
                    setBannedChannels((bannedChannels) => {
                        return new Set(bannedChannels).add(punishment.channel_id);
                    });
                    break;
                case "kicked":
                    break;
            }
        });
        fetchMessages(channel).then((messages) => {
            setMessages(messages);
        });
        return () => {
            socket.off('message');
            socket.off('joinChannel');
            socket.off('staff');
            socket.off('punishment');
        }
    }, [socket, channel]);

    const handleNewMessage = useCallback((message: string) => {
        try {
            axios.post(`http://bess-f1r2s10:3000/channel/${channel.id}/message`, { content: message }, { withCredentials: true })
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
                            <Container direction="row" justify="space-between" alignItems="center" display="flex">
                                <Text h3>{channel.name.replace(/^/, '# ')}</Text>
                                <Button auto light onPress={() => setPowerModalOpen(true)}>
                                    <IconShieldCog />
                                </Button>
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
                                            senderOwner={message.sender.id === ownerId}
                                            senderAdmin={admins.has(message.sender.id)}
                                            isOwner={user.id === ownerId}
                                            isAdmin={admins.has(user.id)}
                                            isAuthor={message.sender.id === user.id}
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
                                        generateMutedMessage(455445455) // TODO: get duration from mutedChannels / bannedChannels
                                    }
                                    aria-label={
                                        !mutedChannels.has(channel.id) ? `Send a message to the channel : ${channel.name}`
                                        :
                                        generateMutedMessage(455445455) // TODO: get duration from mutedChannels / bannedChannels
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

            <PowerModal
                visible={powerModalOpen}
                setVisible={setPowerModalOpen}
                channel={channel}
                user={user}
                admins={admins}
                ownerId={ownerId}
            />
        </Container>
    );
};

export default React.memo(ChatBox);