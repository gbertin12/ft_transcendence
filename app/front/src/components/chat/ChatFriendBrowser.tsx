import React, { useEffect, useState } from "react";
import { Grid, Spinner, Badge, Button, Text } from "@nextui-org/react";
import ChatEntry from "./ChatEntry";
import { IconDeviceGamepad, IconEye, IconMessageCircle } from "@tabler/icons-react";
import { Friend } from "@/interfaces/chat.interfaces";
import { useChat } from "@/contexts/chat.context";
import { useUser } from "@/contexts/user.context";

const ChatFriendBrowser: React.FC = () => {
    const { friends } = useChat();
    const { socket } = useUser();
    return (
        <ul
            style={{
                listStyle: "none",
                padding: 0,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
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
                            css={{ display: (friend.unreadMessages === 0) ? "none" : "block" }}
                        >
                            <IconMessageCircle />
                        </Badge>
                    </Grid>
                </ChatEntry>
            ))}
        </ul>
    );
};

export default ChatFriendBrowser;