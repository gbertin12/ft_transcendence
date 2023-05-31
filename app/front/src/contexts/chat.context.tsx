import { Channel, Friend } from '@/interfaces/chat.interfaces';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './socket.context';

interface ChatContextType {
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    friends: Friend[];
    setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

const ChatContext = createContext<ChatContextType>({
    channels: [],
    setChannels: () => { },
    friends: [],
    setFriends: () => { },
});

export const useChat = () => useContext(ChatContext);

export const ChatContextProvider: React.FC<any> = ({ children }) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        const fetchChannels = async () => {
            const res = await fetch("http://localhost:3000/channel/all", { credentials: "include" });
            if (res.status === 401) {
                // window.location.href = "/auth";
            }
            const data = await res.json();
            setChannels(data);
        };
        const fetchFriends = async () => {
            const res = await fetch("http://localhost:3000/friends/", { credentials: 'include' });
            const data = await res.json();
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
        };

        fetchChannels();
        fetchFriends();
    }, []);

    // Listen for new friends / channels
    const { socket } = useSocket();
    useEffect(() => {
        if (socket) {
            socket.on('newChannel', (payload: Channel) => {
                setChannels((channels) => [...channels, payload]);
            });
            socket.on('deleteChannel', (payload: number) => {
                setChannels((channels) => channels.filter((c) => c.id !== payload));
                // TODO: Rethink this vvv, maybe use NextJS router ?
                // if (selectedChannel?.id === payload) {
                //     setSelectedChannel(channels[0]);
                // }
            });
            socket.on('editChannel', (payload: Channel) => {
                setChannels((channels) => channels.map((c) => c.id === payload.id ? payload : c));
            });
            socket.on('newFriend', (payload: Friend) => {
                setFriends((friends) => [...friends, payload]);
            });
            socket.on('deleteFriend', (payload: number) => { // XXX: Not implemented on the server side
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
            socket.on("online", (payload: any) => {
                setFriends((friends) => friends.map((f) => f.id === payload.user_id ? { ...f, isOnline: true } : f));
            });
            socket.on("offline", (payload: any) => {
                setFriends((friends) => friends.map((f) => f.id === payload.user_id ? { ...f, isOnline: false } : f));
            });
            return () => {
                socket.off('newChannel');
                socket.off('deleteChannel');
                socket.off('editChannel');
                socket.off('newFriend');
                socket.off('deleteFriend');
                socket.off('friendRequestAccepted');
                socket.off('online');
                socket.off('offline');
            }
        }
    }, [socket]);

    return (
        <ChatContext.Provider value={{ channels, setChannels, friends, setFriends }}>
            {children}
        </ChatContext.Provider>
    );
};