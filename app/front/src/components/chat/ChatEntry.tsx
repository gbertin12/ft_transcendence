import { Avatar, Badge, Grid, Text } from '@nextui-org/react';
import React from 'react';

interface ChatEntryProps {
    name: string;
    avatar: string;
    userId: number;
    isOnline: boolean;
    isTyping: boolean;
    isPlaying: boolean;
    unreadMessages?: number;
    children?: React.ReactNode;
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

function getBackgroundColor(isHovered: boolean, isSelected: boolean) {
    if (isSelected) {
        return "$accents1";
    }
    if (isHovered) {
        return "$accents2";
    }
    return "transparent";
}

const ChatEntry: React.FC<ChatEntryProps> = ({ name, avatar, userId, isOnline, isTyping, isPlaying, unreadMessages, children }) => {
    if (unreadMessages === undefined) { unreadMessages = 0; } // default to 0 (ugly hack)

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <Grid.Container
            gap={0.5}
            as="a"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            css={{
                backgroundColor: getBackgroundColor(isHovered, false),
                borderRadius: "5px",
                padding: "5px",
                transition: "background-color 0.05s ease-in-out",
            }}
        >
            <Grid xs={2}>
                <Badge
                    content=""
                    placement="bottom-right"
                    color={getStatusColor(isOnline, isPlaying)}
                    variant={isTyping ? "points" : "dot"}
                >
                    <Avatar
                        size="lg"
                        src={`http://bess-f1r2s5:3000/static/avatars/${avatar}`}
                    />
                </Badge>
            </Grid>
            <Grid xs={8} css={{my: "auto"}}>
                <Text span>{name}</Text>
            </Grid>
            {children}
        </Grid.Container >
    );
};

export default ChatEntry;