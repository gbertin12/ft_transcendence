import React, { useEffect, useState } from "react";
import { Grid, Spinner, Badge } from "@nextui-org/react";
import ChatEntry from "./ChatEntry";
import { IconDeviceGamepad, IconEye, IconMessageCircle } from "@tabler/icons-react";
import { useSocket } from "@/contexts/socket.context";
import { Friend } from "@/interfaces/chat.interfaces";

interface ChatFriendBrowserProps {
    friends: Friend[];
}

const ChatFriendBrowser: React.FC<ChatFriendBrowserProps> = ({ friends }) => {
    return (
        <>
            {friends.map((friend) => (
                <ChatEntry
                    name={friend.name}
                    avatar={friend.avatar}
                    userId={friend.userId}
                    isOnline={friend.isOnline}
                    isTyping={friend.isTyping}
                    isPlaying={friend.isPlaying}
                    unreadMessages={friend.unreadMessages}
                    key={friend.userId}
                >
                    {(friend.isPlaying ? (
                        <Grid xs={1} css={{ my: "auto" }}>
                            <IconEye />
                        </Grid>
                    ) : (
                        <Grid xs={1} css={{ my: "auto" }}>
                            <IconDeviceGamepad />
                        </Grid>
                    ))}
                    <Grid xs={1} css={{ my: "auto" }}>
                        <Badge
                            content={friend.unreadMessages > 9 ? "9+" : friend.unreadMessages.toString()}
                            placement="bottom-right"
                            color="error"
                            isInvisible={(friend.unreadMessages === 0)}
                        >
                            <IconMessageCircle />
                        </Badge>
                    </Grid>
                </ChatEntry>
            ))}
        </>
    );
};

export default ChatFriendBrowser;