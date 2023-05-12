import React, { useEffect, useState } from "react";
import { Text, Grid, Spinner } from "@nextui-org/react";
import ChatEntry from "./ChatEntry";

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

    useEffect(() => {
        fetch("http://localhost:3000/friends/", { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const friends: Friend[] = data.map((friend) => {
                        return {
                            id: friend.User.id,
                            name: friend.User.name,
                            avatar: friend.User.avatar,
                            userId: friend.User.id,
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
                />
            ))}
        </>
    );
};

export default ChatFriendBrowser;