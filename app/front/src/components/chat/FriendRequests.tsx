import { Friend, FriendRequest, User } from "@/interfaces/chat.interfaces";
import { Badge, Grid, Text } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import { useUser } from "@/contexts/user.context";
import axios from "axios";
import { useChat } from "@/contexts/chat.context";

interface PolyFriendRequest {
    requests: FriendRequest[];
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
}

const ReceivedRequests: React.FC<PolyFriendRequest> = ({ requests, setFriendRequests }) => {
    if (requests.length === 0) {
        return <></>;
    }

    return (
        <>
            <Text h4>Received requests</Text>
            <hr />
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
                {requests.map((request) => (
                    <li className="list-none">
                        <ChatEntry
                            name={request.sender.name}
                            avatar={request.sender.avatar}
                            userId={request.sender.id}
                            isOnline={false} // set these to false to obfuscate the data
                            isTyping={false}
                            isPlaying={false}
                            unreadMessages={0}
                            key={request.sender_id}
                        >
                            <Grid xs={1}>
                                <IconCheck onClick={() => {
                                    axios.post(`http://localhost:3000/friends/requests/${request.sender_id}/accept`, {}, { withCredentials: true })
                                        .then((res) => {
                                            if (res.status !== 200) return;
                                            setFriendRequests((requests) => requests.filter((request) => request.sender_id !== request.sender_id));
                                        })
                                }} />
                                <IconX onClick={() => {
                                    axios.delete(`http://localhost:3000/friends/requests/${request.sender_id}`, { withCredentials: true })
                                        .then((res) => {
                                            if (res.status !== 200) return;
                                            setFriendRequests((requests) => requests.filter((request) => request.sender_id !== request.sender_id));
                                        })
                                }} />
                            </Grid>
                        </ChatEntry>
                    </li>
                ))}
            </ul>
        </>
    );
}

const SentRequests: React.FC<PolyFriendRequest> = ({ requests, setFriendRequests }) => {
    if (requests.length === 0) {
        return <></>;
    }

    return (
        <>
            <Text h4>Sent requests</Text>
            <hr />
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
                {requests.map((request) => (
                    <li className="list-none">
                        <ChatEntry
                            name={request.receiver.name}
                            avatar={request.receiver.avatar}
                            userId={request.receiver.id}
                            isOnline={false} // set these to false to obfuscate the data
                            isTyping={false}
                            isPlaying={false}
                            unreadMessages={0}
                            key={request.receiver_id}
                        >
                            <Grid xs={1}>
                                <IconClock />
                                <IconX onClick={() => {
                                    axios.delete(`http://localhost:3000/friends/requests/cancel/${request.receiver_id}`, { withCredentials: true })
                                        .then((res) => {
                                            if (res.status !== 200) return;
                                            setFriendRequests((requests) => requests.filter((request) => request.sender_id !== request.sender_id));
                                        })
                                }} />
                            </Grid>
                        </ChatEntry>
                    </li>
                ))}
            </ul>
        </>
    );
}

const FriendRequests: React.FC = () => {
    const { user, socket } = useUser();
    const { friendRequests, setFriendRequests } = useChat();
    const [sentRequests, setSentRequests] = React.useState<FriendRequest[]>([]);
    const [receivedRequests, setReceivedRequests] = React.useState<FriendRequest[]>([]);


    React.useEffect(() => {
        if (!socket) { return; }
        socket.on("friendRequestDeleted", (request: FriendRequest) => {
            setFriendRequests((requests) => requests.filter((r) => r.sender_id !== request.sender_id || r.receiver_id !== request.receiver_id));
        });
        socket.on("friendRequestAdded", (request: FriendRequest) => {
            setFriendRequests((requests) => [...requests, request]);
        });

        return () => {
            socket.off("friendRequestDeleted");
            socket.off("friendRequestAdded");
        }
    }, []);

    React.useEffect(() => {
        setSentRequests(friendRequests.filter((request) => request.sender_id === user.id));
        setReceivedRequests(friendRequests.filter((request) => request.receiver_id === user.id));
    }, [friendRequests]);

    if (friendRequests.length === 0) {
        return <></>;
    }

    return (
        <div className="mt-2">
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
            </ul>
            {/* {friendRequests.map((friendRequest) => (
                <li className="list-none">
                    <ChatEntry
                        name={friendRequest.sender.name}
                        avatar={friendRequest.sender.avatar}
                        userId={friendRequest.sender.id}
                        isOnline={false} // set these to false to obfuscate the data
                        isTyping={false}
                        isPlaying={false}
                        unreadMessages={0}
                        key={friendRequest.sender_id}
                    >
                        <Grid xs={1}>
                            <IconX onClick={() => {
                                axios.delete(`http://localhost:3000/friends/requests/${friendRequest.sender_id}`, {
                                    withCredentials: true,
                                }).then(() => {
                                    setFriendRequests((requests) => requests.filter((request) => request.sender_id !== friendRequest.sender_id));
                                }).catch((error) => {
                                    throw Error("UNEXPECTED ERROR: " + error);
                                });
                            }} />
                        </Grid>
                        <Grid xs={1}>
                            {friendRequest.sender_id === user.id ? (
                                <IconClock />
                            ) : (
                                <IconCheck onClick={() => {
                                    axios.post(`http://localhost:3000/friends/requests/${friendRequest.sender_id}/accept`, {}, {
                                        withCredentials: true,
                                    }).then(() => {
                                        setFriendRequests((requests) => requests.filter((request) => request.sender_id !== friendRequest.sender_id));
                                    }).catch((error) => {
                                        throw Error("UNEXPECTED ERROR: " + error);
                                    });
                                }} />
                            )}
                        </Grid>
                    </ChatEntry>
                </li>
            ))}
        </> */}
            <div className="mt-2">
                <ReceivedRequests requests={receivedRequests} setFriendRequests={setFriendRequests} />
                <SentRequests requests={sentRequests} setFriendRequests={setFriendRequests} />
            </div>
        </div>
    );
}

export default FriendRequests;