import { Avatar, Badge, Grid, Text } from '@nextui-org/react';
import React from 'react';
import { FaComment } from 'react-icons/fa';
import { FaEye, FaGamepad } from 'react-icons/fa';

interface ChatEntryProps {
    name: string;
    userId: number;
    isOnline: boolean;
    isTyping: boolean;
    isPlaying: boolean;
    unreadMessages?: number;
}

function getStatusColor(isOnline: boolean, isPlaying: boolean) {
    if (!isOnline) {
        return "default";
    }
    if (isPlaying) {
        return "error";
    }
    return "success";
}

const ChatEntry: React.FC<ChatEntryProps> = ({ name, userId, isOnline, isTyping, isPlaying, unreadMessages }) => {
    if (unreadMessages === undefined) { unreadMessages = 0; } // default to 0 (ugly hack)
    return (
        <Grid.Container gap={1}>
            <Grid css={{w: "stretch"}} xs={2}>
                <Badge
                    content=""
                    placement="bottom-right"
                    color={getStatusColor(isOnline, isPlaying)}
                    variant={isTyping ? "points" : "dot"}
                >
                    <Avatar
                        size="lg"
                    />
                </Badge>
            </Grid>
            <Grid xs={8} css={{my: "auto"}}>
                <Text span>{name}</Text>
            </Grid>
            {(isPlaying ? (
                <Grid xs={1} css={{my: "auto"}}>
                    <FaEye size="md"/>
                </Grid>
            ) : (
                <Grid xs={1} css={{my: "auto"}}>
                    <FaGamepad size="md"/>
                </Grid>
            ))}
            <Grid xs={1} css={{my: "auto"}}>
                <Badge
                    content={unreadMessages > 9 ? "9+" : unreadMessages.toString()}
                    placement="bottom-right"
                    color="error"
                    isInvisible={(unreadMessages === 0)}
                >
                    <FaComment />
                </Badge>
            </Grid>

        </Grid.Container >
    );
};

export default ChatEntry;