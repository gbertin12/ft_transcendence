import { Channel, Friend, FriendRequest, Relationships } from '@/interfaces/chat.interfaces';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './user.context';
import axios from 'axios';

interface ChatContextType {
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    friends: Friend[];
    setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
    bannedChannels: Set<number>;
    setBannedChannels: React.Dispatch<React.SetStateAction<Set<number>>>;
    mutedChannels: Set<number>;
    setMutedChannels: React.Dispatch<React.SetStateAction<Set<number>>>;
    friendRequests: FriendRequest[];
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
    blockedUsers: Set<number>;
    setBlockedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
    sentRequests: FriendRequest[];
    setSentRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
    receivedRequests: FriendRequest[]
    setReceivedRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
}

const ChatContext = createContext<ChatContextType>({
    channels: [],
    setChannels: () => { },
    friends: [],
    setFriends: () => { },
    bannedChannels: new Set<number>(),
    setBannedChannels: () => { },
    mutedChannels: new Set<number>(),
    setMutedChannels: () => { },
    friendRequests: [],
    setFriendRequests: () => { },
    blockedUsers: new Set<number>(),
    setBlockedUsers: () => { },
    sentRequests: [],
    setSentRequests: () => { },
    receivedRequests: [],
    setReceivedRequests: () => { },
});

export const useChat = () => useContext(ChatContext);

export const ChatContextProvider: React.FC<any> = ({ children }) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [bannedChannels, setBannedChannels] = useState<Set<number>>(new Set<number>());
    const [mutedChannels, setMutedChannels] = useState<Set<number>>(new Set<number>());
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set<number>());
    const [sentRequests, setSentRequests] = React.useState<FriendRequest[]>([]);
    const [receivedRequests, setReceivedRequests] = React.useState<FriendRequest[]>([]);

    const { user } = useUser();

    useEffect(() => {
        const fetchChannels = async () => {
            axios.get("http://localhost:3000/channel/all", 
                {
                    withCredentials: true,
                    validateStatus: () => true,
                })
                .then((res) => {
                    if (res.status !== 200) return ;
                    setChannels(res.data);
                })
        };
        const fetchFriends = async () => {
            if (user.id === undefined) return;
            axios.get("http://localhost:3000/friends?blocked=true", { withCredentials: true })
                .then((res) => {
                    if (res.status !== 200) return ;
                    const relationships: Relationships = res.data;
                    if (Array.isArray(relationships.friends)) {
                        const friends: Friend[] = relationships.friends.map((friend) => {
                            // if user id is self, use user2 instead
                            if (friend.friend_id === user.id) {
                                return {
                                    id: friend.user2.id,
                                    name: friend.user2.name,
                                    avatar: friend.user2.avatar,
                                    userId: friend.user2.id,
                                    isOnline: false,
                                    isTyping: false,
                                    isPlaying: false,
                                    unreadMessages: 0,
                                };
                            } else {
                                return {
                                    id: friend.user.id,
                                    name: friend.user.name,
                                    avatar: friend.user.avatar,
                                    userId: friend.user.id,
                                    isOnline: false,
                                    isTyping: false,
                                    isPlaying: false,
                                    unreadMessages: 0,
                                };
                            }
                        });
                        const blockedUsers: Set<number> = new Set<number>();
                        if (Array.isArray(relationships.blocked)) {
                            relationships.blocked.forEach((blocked) => {
                                blockedUsers.add(blocked.blocked_id);
                            });
                        }
                        setBlockedUsers(blockedUsers);
                        setFriends(friends);
                        socket.emit("updateStatus", {"status": "online"});
                    }
                }).catch((err) => {
                    return ;
                });
        };
        const fetchBans = async () => {
            if (user.id === undefined) return;
            try {
                axios.get("http://localhost:3000/punishments/active", 
                    {
                        withCredentials: true,
                        validateStatus: () => true,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            // TODO: handle durations too
                            if (res.data.hasOwnProperty("banned")) {
                                setBannedChannels(new Set<number>(res.data.banned));
                            }
                            if (res.data.hasOwnProperty("muted")) {
                                setMutedChannels(new Set<number>(res.data.muted));
                            }
                        }
                    });
            }
            catch (err) {
                return ;
            }
        }
        const fetchFriendRequests = async () => {
            if (user.id === undefined) return;
            axios.get("http://localhost:3000/friends/requests", {
                withCredentials: true,
                validateStatus: () => true,
            }).then((response) => {
                    if (response.status === 200) {
                        setFriendRequests(response.data);
                    }
                });
        };

        fetchChannels();
        fetchFriends();
        fetchBans();
        fetchFriendRequests();
    }, [user]);

    // Listen for new friends / channels
    const { socket } = useUser();
    useEffect(() => {
        if (socket) {
            socket.on('newChannel', (payload: Channel) => {
                setChannels((channels) => [...channels, payload]);
            });
            socket.on('deleteChannel', (payload: number) => {
                setChannels((channels) => channels.filter((c) => c.id !== payload));
            });
            socket.on('editChannel', (payload: Channel) => {
                setChannels((channels) => channels.map((c) => c.id === payload.id ? payload : c));
            });
            socket.on('deleteFriend', (user_id: number) => {
                setFriends((friends) => friends.filter((f) => f.id !== user_id));
            });
            socket.on("friendRequestAccepted", (payload: any) => {
                let newFriend: Friend = {
                    id: payload.user.id,
                    name: payload.user.name,
                    avatar: payload.user.avatar,
                    userId: payload.user.id,
                    isOnline: false,
                    isTyping: false,
                    isPlaying: false,
                    unreadMessages: 0,
                }
                setFriends((friends) => [...friends, newFriend]);
            });
            socket.on("friendRequestDeleted", (request: FriendRequest) => {
                setFriendRequests((requests) => requests.filter((r) => r.sender_id !== request.sender_id || r.receiver_id !== request.receiver_id));
            });
            socket.on("friendRequestAdded", (request: FriendRequest) => {
                setFriendRequests((requests) => [...requests, request]);
            });
            socket.on("online", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.id === friend_id ? { ...f, isOnline: true, isPlaying: false } : f));
                socket.emit("onlineAnswer", friend_id);
            });
            socket.on("typing", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.id === friend_id ? { ...f, isTyping: true } : f));
            });
            socket.on("playing", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.id === friend_id ? { ...f, isPlaying: true, isTyping: false, isOnline: true} : f));
            });
            socket.on("onlineAnswer", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.id === friend_id ? { ...f, isOnline: true, isTyping: false, isPlaying: false } : f));
            });
            socket.on("offline", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.id === friend_id ? { ...f, isOnline: false, isTyping: false, isPlaying: false } : f));
            });
            socket.on("unbanned", (channel_id: number) => { // TODO: Implement on the server side
                setBannedChannels((bannedChannels) => {
                    const newBannedChannels = new Set<number>(bannedChannels);
                    newBannedChannels.delete(channel_id);
                    return newBannedChannels;
                });
            });
            socket.on("unmuted", (channel_id: number) => { // TODO: Implement on the server side
                setMutedChannels((mutedChannels) => {
                    const newMutedChannels = new Set<number>(mutedChannels);
                    newMutedChannels.delete(channel_id);
                    return newMutedChannels;
                });
            });
            socket.on("blocked", (user_id: number) => {
                setBlockedUsers((blockedUsers) => {
                    const newBlockedUsers = new Set<number>(blockedUsers);
                    newBlockedUsers.add(user_id);
                    return newBlockedUsers;
                });
            });
            socket.on("unblocked", (user_id: number) => {
                setBlockedUsers((blockedUsers) => {
                    const newBlockedUsers = new Set<number>(blockedUsers);
                    newBlockedUsers.delete(user_id);
                    return newBlockedUsers;
                });
            });
            return () => {
                socket.off("newChannel");
                socket.off("deleteChannel");
                socket.off("editChannel");
                socket.off("deleteFriend");
                socket.off("friendRequestAccepted");
                socket.off("friendRequestDeleted");
                socket.off("friendRequestAdded");
                socket.off("online");
                socket.off("typing");
                socket.off("playing");
                socket.off("onlineAnswer");
                socket.off("offline");
                socket.off("unbanned");
                socket.off("unmuted");
                socket.off("blocked");
            }
        }
    }, [socket]);

    React.useEffect(() => {
        setSentRequests(friendRequests.filter((request) => request.sender_id === user.id));
        setReceivedRequests(friendRequests.filter((request) => request.receiver_id === user.id));
    }, [friendRequests]);

    return (
        <ChatContext.Provider value={{
            channels,
            setChannels,
            friends,
            setFriends,
            bannedChannels,
            setBannedChannels,
            mutedChannels,
            setMutedChannels,
            friendRequests,
            setFriendRequests,
            blockedUsers,
            setBlockedUsers,
            sentRequests,
            setSentRequests,
            receivedRequests,
            setReceivedRequests,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
