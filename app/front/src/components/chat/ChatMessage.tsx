import { Channel, MessageData, SenderData, User } from '@/interfaces/chat.interfaces';
import { Avatar, Text, Tooltip } from '@nextui-org/react';
import { IconCrown, IconShield } from '@tabler/icons-react';
import React from 'react';
import PowerActions from './powertools/PowerActions';
import AvatarTooltip from '../profile/AvatarTooltip';

interface ChatMessageProps {
    data: MessageData;
    concatenate: boolean;
    channel?: Channel;
    interlocutor?: User;
    sender: User;
    blocked?: boolean;
    isAuthor?: boolean;
    senderOwner?: boolean;
    senderAdmin?: boolean;
    isOwner?: boolean; // current user
    isAdmin?: boolean; // current user
    ghost?: boolean;
}

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        return `Today ${hours}:${minutes}`;
    }
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
        return `Yesterday ${hours}:${minutes}`;
    }
    return `${date.toLocaleDateString()} at ${hours}:${minutes}`;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ data, concatenate, channel, interlocutor, sender, blocked, isAuthor, senderOwner, senderAdmin, isOwner, isAdmin, ghost }) => {
    const [hover, setHover] = React.useState<boolean>(false);

    if (data.sender.id === -1) { // System message
        return (
            <Text
                span
                color="$accents7"
                css={{
                    ta: "center",
                    display: "block",
                }}
            >
                {data.content}
            </Text>
        )
    }

    return (
        <div>
            <div
                className='static ml-0 indent-0 pl-[70px]'
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {!concatenate && (
                    <>
                        <div
                            style={{
                                position: "absolute",
                                left: "16px",
                                width: "40px",
                                height: "40px",
                                marginTop: "calc(4px - 0.125rem)",
                            }}
                        >
                            <AvatarTooltip
                                user={data.sender}
                                placement="top"
                            />
                        </div>
                        <Text className="overflow-hidden block relative">
                            <Text span color="primary" className="mr-1 text-lg font-medium">
                                {data.sender.name + (blocked ? " (blocked)" : "")}
                                {senderOwner && (
                                    <Text color="$error" css={{ display: "inline-flex" }}>
                                        <Tooltip
                                            rounded
                                            hideArrow
                                            color="error"
                                            content="Owner"
                                        >
                                            <IconCrown
                                                size={20}
                                                cursor="pointer"
                                                style={{
                                                    marginLeft: "0.25rem",
                                                }}
                                            />
                                        </Tooltip>
                                    </Text>
                                )}
                                {senderAdmin && (
                                    <Text
                                        color="$warning"
                                        css={{ display: "inline-flex" }}
                                    >
                                        <Tooltip
                                            rounded
                                            hideArrow
                                            color="warning"
                                            content="Admin"
                                        >
                                            <IconShield
                                                size={20}
                                                cursor="pointer"
                                                style={{
                                                    marginLeft: "0.25rem",
                                                }}
                                            />
                                        </Tooltip>
                                    </Text>
                                )}
                            </Text>
                            <Text span color="$neutral" className="text-sm">{formatDate(data.timestamp)}</Text>
                        </Text>
                    </>
                )}
                <div className='absolute right-4 top-0'>
                    {hover && (
                        <PowerActions
                            channel={channel}
                            interlocutor={interlocutor}
                            sender={sender}
                            message={data}
                            isAuthor={isAuthor || false}
                            isOwner={(isOwner || false)}
                            isAdmin={(isAdmin || false)}
                            blocked={blocked || false}
                        />
                    )}
                </div>
                <div className={(blocked ? "blur-sm hover:blur-none" : "")}>
                    {/* wrap the text */}
                    <Text span css={{
                        wordWrap: "break-word",
                    }}>
                        {data.content}
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;