import { MessageData } from '@/interfaces/chat.interfaces';
import { Avatar, Text, Tooltip } from '@nextui-org/react';
import { IconCrown, IconShield } from '@tabler/icons-react';
import React from 'react';

interface ChatMessageProps {
    data: MessageData;
    concatenate: boolean;
    isOwner?: boolean;
    isAdmin?: boolean;
    ghost?: boolean;
}

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        return `Aujourd'hui à ${date.getHours()}:${date.getMinutes()}`;
    }
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
        return `Hier à ${date.getHours()}:${date.getMinutes()}`;
    }
    return `${date.toLocaleDateString()} à ${date.getHours()}:${date.getMinutes()}`;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ data, concatenate, isOwner, isAdmin }) => {
    return (
        <div>
            <div className='static ml-0 indent-0 pl-[70px]'>
                {!concatenate && (
                    <>
                        <Avatar
                            src={`http://localhost:3000/static/avatars/${data.sender.avatar}`}
                            css={{
                                position: "absolute",
                                left: "16px",
                                w: "40px",
                                h: "40px",
                                mt: "calc(4px - 0.125rem)",
                            }}
                        />
                        <Text className="overflow-hidden block relative">
                            <Text span color="$black" className="mr-1 text-lg font-medium">
                                {data.sender.name}
                                {isOwner && (
                                    <Text color="$error" css={{display: "inline-flex"}}>
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
                                {isAdmin && (
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
                <div>
                    <Text span>
                        {data.content}
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;