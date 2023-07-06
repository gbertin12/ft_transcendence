import { Avatar, Badge, Grid, Text } from '@nextui-org/react';
import React from 'react';
import AvatarTooltip from '../profile/AvatarTooltip';
import { User } from '@/interfaces/chat.interfaces';

interface ChatEntryProps {
    user: User;
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

const ChatEntry: React.FC<ChatEntryProps> = ({ user, isOnline, isTyping, isPlaying, unreadMessages, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <Grid.Container
            gap={0.5}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            css={{
                backgroundColor: getBackgroundColor(isHovered, false),
                borderRadius: "5px",
                padding: "5px",
                transition: "background-color 0.05s ease-in-out",
                cursor: "pointer",
            }}
        >
            <Grid xs={2}>
                <Badge
                    content=""
                    placement="bottom-right"
                    color={getStatusColor(isOnline, isPlaying)}
                    variant={isTyping ? "points" : "dot"}
                >
                    <AvatarTooltip
                        placement='left'
                        user={user}
                    />
                </Badge>
            </Grid>
            <Grid xs={8} css={{my: "auto"}}>
                <Text span>{user.name}</Text>
            </Grid>
            {children}
        </Grid.Container >
    );
};

export default ChatEntry;