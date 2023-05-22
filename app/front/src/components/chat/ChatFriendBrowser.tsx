import React, { useEffect, useState } from "react";
import { Grid, Spinner, Badge } from "@nextui-org/react";
import ChatEntry from "./ChatEntry";
import { IconDeviceGamepad, IconEye, IconMessageCircle } from "@tabler/icons-react";
import { useSocket } from "@/contexts/socket.context";

interface Friend {
    id: number;
    name: string;
    avatar: string;
    userId: number;
    isOnline: boolean;
    isTyping: boolean;
    isPlaying: boolean;
    unreadMessages: number;
}

const ChatFriendBrowser: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { socket } = useSocket();

    useEffect(() => {
        fetch("http://localhost:3000/friends/", { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const friends: Friend[] = data.map((friend) => {
                        return {
                            id: friend.user.id,
                            name: friend.user.name,
                            avatar: friend.user.avatar,
                            userId: friend.user.id,
                            isOnline: false, // TODO: implement
                            isTyping: false,
                            isPlaying: false,
                            unreadMessages: 0,
                        };
                    });
                    setFriends(friends);
                } else {
                    console.error("Error fetching friends: data is not an array");
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching friends:", error);
                setIsLoading(false);
            });

            socket.on("friendRequestAccepted", (payload: any) => {
                let newFriend: Friend = {
                    id: payload.user.id,
                    name: payload.user.name,
                    avatar: payload.user.avatar,
                    userId: payload.user.id,
                    isOnline: false, // TODO: implement
                    isTyping: false,
                    isPlaying: false,
                    unreadMessages: 0,
                }
                setFriends((friends) => [...friends, newFriend]);
            });

            return () => {
                socket.off("friendRequestAccepted");
            }
    }, []);

    if (isLoading) {
        return <Spinner />;
    }
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