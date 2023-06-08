import { Channel, Friend } from '@/interfaces/chat.interfaces';
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
});

export const useChat = () => useContext(ChatContext);

export const ChatContextProvider: React.FC<any> = ({ children }) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [bannedChannels, setBannedChannels] = useState<Set<number>>(new Set<number>());
    const [mutedChannels, setMutedChannels] = useState<Set<number>>(new Set<number>());

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
            axios.get("http://localhost:3000/friends/", { withCredentials: true })
            .then((res) => {
                if (res.status !== 200) return ;
                if (Array.isArray(res.data)) {
                    const friends: Friend[] = res.data.map((friend) => {
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
                    socket.emit("updateStatus", {"status": "online"});
                }
            }).catch((err) => {
                return ;
            });
        };
        const fetchBans = async () => {
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

        fetchChannels();
        fetchFriends();
        fetchBans();
    }, []);

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
            socket.on('newFriend', (payload: Friend) => {
                setFriends((friends) => [...friends, payload]);
            });
            socket.on('deleteFriend', (payload: number) => { // TODO: Implement on the server side
                setFriends((friends) => friends.filter((f) => f.id !== payload));
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
            return () => {
                socket.off("newChannel");
                socket.off("deleteChannel");
                socket.off("editChannel");
                socket.off("newFriend");
                socket.off("deleteFriend");
                socket.off("friendRequestAccepted");
                socket.off("online");
                socket.off("typing");
                socket.off("playing");
                socket.off("onlineAnswer");
                socket.off("offline");
                socket.off("unbanned");
            }
        }
    }, [socket]);

    return (
        <ChatContext.Provider value={{ channels, setChannels, friends, setFriends, bannedChannels, setBannedChannels, mutedChannels, setMutedChannels }}>
            {children}
        </ChatContext.Provider>
    );
};