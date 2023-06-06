import { FriendRequest } from "@/interfaces/chat.interfaces";
import { Badge, Grid, Text } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import { IconCheck } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import { useUser } from "@/contexts/user.context";
const FriendRequests: React.FC = () => {
    const [friendRequests, setFriendRequests] = React.useState<FriendRequest[]>([]);
    const { socket } = useUser();

    React.useEffect(() => {
        const fetchFriendRequests = async () => {
            const response = await fetch("http://localhost:3000/friends/requests", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFriendRequests(data);
            }
        };

        fetchFriendRequests();
    }, []);

    React.useEffect(() => {
        if (!socket) { return; }
        socket.on("friendRequestDeleted", (requestId: number) => {
            setFriendRequests((requests) => requests.filter((request) => request.request_id !== requestId));
        });
        socket.on("friendRequestAdded", (request: FriendRequest) => {
            setFriendRequests((requests) => [...requests, request]);
        });

        return () => {
            socket.off("friendRequestDeleted");
            socket.off("friendRequestAdded");
        }
    }, []);

    if (friendRequests.length === 0) {
        return <></>;
    }

    return (
        <>
            <Text h3>Friend requests</Text>
            <hr />
            {friendRequests.map((friendRequest) => (
                <ChatEntry
                    name={friendRequest.sender.name}
                    avatar={friendRequest.sender.avatar}
                    userId={friendRequest.sender.id}
                    isOnline={false} // set these to false to obfuscate the data
                    isTyping={false}
                    isPlaying={false}
                    unreadMessages={0}
                    key={friendRequest.request_id}
                >
                    <Grid xs={1}>
                        <IconX onClick={() => {
                            fetch(`http://localhost:3000/friends/requests/${friendRequest.request_id}`, {
                                method: "DELETE",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            });
                        }} />
                    </Grid>
                    <Grid xs={1}>
                        <IconCheck onClick={() => {
                            fetch(`http://localhost:3000/friends/requests/${friendRequest.request_id}/accept`, {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }).then(() => {
                                setFriendRequests((requests) => requests.filter((request) => request.request_id !== friendRequest.request_id));
                            });
                        }} />
                    </Grid>
                </ChatEntry>
            ))}
        </>
    );
}

export default FriendRequests;