import ChanneldGrid from "@/components/chat/grids/ChannelsGrid";
import FriendGrid from "@/components/chat/grids/FriendGrid";
import { useSocket } from "@/contexts/socket.context";
import { Channel, Friend } from "@/interfaces/chat.interfaces";
import { Container, Grid } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function ChatLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode;
}) {
    const { socket } = useSocket();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        fetch("http://localhost:3000/channel/all", { credentials: "include" })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/auth";
                }
                return res;
            })
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
            });
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
            })
            .catch((error) => {
                console.error("Error fetching friends:", error);
            });
    }, []);

    // TODO: Fetch channels and friends, and pass them to the grids as props to not fetch them again each time

    useEffect(() => {
        // Listen for new messages
        socket.on('newChannel', (payload: Channel) => {
            setChannels((channels) => [...channels, payload]);
        });
        socket.on('deleteChannel', (payload: number) => {
            setChannels((channels) => channels.filter((c) => c.id !== payload));
            // if (selectedChannel?.id === payload) {
            //     setSelectedChannel(channels[0]);
            // }
        });
        socket.on('editChannel', (payload: any) => {
            setChannels((channels) => channels.map((c) => c.id === payload.id ? payload : c));
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
            socket.off('message');
            socket.off('newChannel');
            socket.off('deleteChannel');
            socket.off('editChannel');
            socket.off("friendRequestAccepted");
        }
    }, [socket]);

    return (
        <>
            <Grid.Container css={{"mx": "$4"}}>
                <ChanneldGrid channels={channels} />
                <Grid xs={6} direction="column">
                    {children}
                </Grid>
                <FriendGrid friends={friends} />
            </Grid.Container>
        </>
    );
}