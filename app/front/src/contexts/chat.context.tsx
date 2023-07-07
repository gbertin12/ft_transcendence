import { Channel, ChannelInvite, Friend, FriendRequest, Message, PunishmentData, Relationships } from '@/interfaces/chat.interfaces';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './user.context';
import axios from 'axios';

interface ChatContextType {
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    selectedChannel: Channel | null;
    setSelectedChannel: React.Dispatch<React.SetStateAction<Channel | null>>;
    channelInvites: ChannelInvite[];
    setChannelInvites: React.Dispatch<React.SetStateAction<ChannelInvite[]>>;
    privateChannels: Channel[];
    setPrivateChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    publicChannels: Channel[];
    setPublicChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
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

interface OwnerUpdate {
    channel_id: number;
    new_owner: number;
}

const ChatContext = createContext<ChatContextType>({
    channels: [],
    setChannels: () => { },
    selectedChannel: null,
    setSelectedChannel: () => { },
    channelInvites: [],
    setChannelInvites: () => { },
    privateChannels: [],
    setPrivateChannels: () => { },
    publicChannels: [],
    setPublicChannels: () => { },
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
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [privateChannels, setPrivateChannels] = useState<Channel[]>([]);
    const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
    const [channelInvites, setChannelInvites] = useState<ChannelInvite[]>([]);
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
                    if (res.status !== 200) return;
                    setChannels(res.data);
                })
        };
        const fetchFriends = async () => {
            if (user.id === undefined) return;
            axios.get("http://localhost:3000/friends?blocked=true", { withCredentials: true })
                .then((res) => {
                    if (res.status !== 200) return;
                    const relationships: Relationships = res.data;
                    if (Array.isArray(relationships.friends)) {
                        const friends: Friend[] = relationships.friends.map((friend) => {
                            // if user id is self, use user2 instead
                            if (friend.user.id === user.id) {
                                return {
                                    user: friend.user2,
                                    isOnline: false,
                                    isTyping: false,
                                    isPlaying: false,
                                    unreadMessages: 0,
                                };
                            } else {
                                return {
                                    user: friend.user,
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
                        axios.patch(`http://localhost:3000/friends/status/online`, {}, { withCredentials: true, validateStatus: () => true });
                    }
                }).catch((err) => {
                    return;
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
                            let mutes = new Set<number>();
                            let bans = new Set<number>();
                            // Loop through the array in res.data, and add channel whose types are 0 to mutes, and 1 to bans
                            let maxDate = new Date();
                            maxDate.setFullYear(maxDate.getFullYear() + 5);
                            res.data.forEach((punishment: PunishmentData) => {
                                let date: Date = (punishment.expires_at) ? new Date(punishment.expires_at) : maxDate;
                                switch (punishment.type) {
                                    case 1:
                                        mutes.add(punishment.channel_id);
                                        if (date.getTime() - new Date().getTime() < 86400000) {
                                            setTimeout(() => {
                                                let newMutes = new Set<number>(mutedChannels);
                                                newMutes.delete(punishment.channel_id);
                                                setMutedChannels(newMutes);
                                            }, date.getTime() - new Date().getTime());
                                        }
                                        break;
                                    case 0:
                                        bans.add(punishment.channel_id);
                                        setTimeout(() => {
                                            if (date.getTime() - new Date().getTime() < 86400000) {
                                                let newBans = new Set<number>(bannedChannels);
                                                newBans.delete(punishment.channel_id);
                                                setBannedChannels(newBans);
                                            }
                                        }, date.getTime() - new Date().getTime());
                                    default:
                                        break;
                                }
                            });
                            setBannedChannels(bans);
                            setMutedChannels(mutes);
                        }
                    });
            }
            catch (err) {
                return;
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
        const fetchChannelInvites = async () => {
            if (user.id === undefined) return;
            axios.get("http://localhost:3000/channel/invites", {
                withCredentials: true,
                validateStatus: () => true,
            }).then((response) => {
                if (response.status === 200) {
                    setChannelInvites(response.data);
                }
            });
        };
        fetchChannels();
        fetchFriends();
        fetchBans();
        fetchFriendRequests();
        fetchChannelInvites();
    }, [user]);

    useEffect(() => {
        // Filter out public channels / private channels that user is in
        const publicChannels = channels.filter((channel) => !channel.private);
        const privateChannels = channels.filter((channel) => channel.private); // The API only returns private channels that user is in
        setPublicChannels(publicChannels);
        setPrivateChannels(privateChannels);
    }, [channels])

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
                setFriends((friends) => friends.filter((f) => f.user.id !== user_id));
            });
            socket.on("friendRequestAccepted", (payload: any) => {
                let newFriend: Friend = {
                    user: payload.user,
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
                setFriends((friends) => friends.map((f) => f.user.id === friend_id ? { ...f, isOnline: true, isPlaying: false } : f));
            });
            socket.on("typing", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.user.id === friend_id ? { ...f, isTyping: true } : f));
            });
            socket.on("playing", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.user.id === friend_id ? { ...f, isPlaying: true, isTyping: false, isOnline: true } : f));
            });
            socket.on("offline", (friend_id: number) => {
                setFriends((friends) => friends.map((f) => f.user.id === friend_id ? { ...f, isOnline: false, isTyping: false, isPlaying: false } : f));
            });
            socket.on("punishment_revoked", (channel_id: number) => {
                setBannedChannels((bannedChannels) => {
                    const newBannedChannels = new Set<number>(bannedChannels);
                    newBannedChannels.delete(channel_id);
                    return newBannedChannels;
                });
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
            socket.on("dmMessage", (payload: any) => {
                // If the href is not in the good dm, increment the unread messages
                if (!window.location.href.includes(`/dm/${payload.sender_id}`) && !window.location.href.includes(`/dm/${payload.receiver_id}`)) {
                    setFriends(
                        (friends) => friends.map((f) => f.user.id === payload.sender_id ? { ...f, unreadMessages: f.unreadMessages + 1 } : f)
                    );
                }
            });
            socket.on("updateOwner", (data: OwnerUpdate) => {
                setChannels((channels) => channels.map((c) => c.id === data.channel_id ? { ...c, owner_id: data.new_owner } : c));
            });
            socket.on("punishment", (punishment: PunishmentData) => {
                const noTimeoutThreshold = 157679999;
                switch (punishment.type) {
                    case "muted":
                        setMutedChannels((mutedChannels) => {
                            return new Set(mutedChannels).add(punishment.channel_id);
                        });
                        // Add a timeout to remove the channel from the list of banned channels
                        if (punishment.duration && punishment.duration < noTimeoutThreshold) {
                            setTimeout(() => {
                                setMutedChannels((mutedChannels) => {
                                    const newMutedChannels = new Set(mutedChannels);
                                    newMutedChannels.delete(punishment.channel_id);
                                    return newMutedChannels;
                                });
                            }, (punishment.duration ? punishment.duration * 1000 : Infinity));
                        }
                        break;
                    case "banned":
                        setBannedChannels((bannedChannels) => {
                            return new Set(bannedChannels).add(punishment.channel_id);
                        });
                        // Add a timeout to remove the channel from the list of banned channels
                        if (punishment.duration && punishment.duration < noTimeoutThreshold) {
                            setTimeout(() => {
                                setBannedChannels((bannedChannels) => {
                                    const newBannedChannels = new Set(bannedChannels);
                                    newBannedChannels.delete(punishment.channel_id);
                                    return newBannedChannels;
                                });
                            }, (punishment.duration ? punishment.duration * 1000 : Infinity));
                        }
                        break;
                    case "kicked":
                        // remove the channel from the list of channels
                        setChannels((channels) => {
                            const index = channels.findIndex((channel) => channel.id === punishment.channel_id);
                            if (index !== -1) {
                                channels.splice(index, 1);
                            }
                            return [...channels];
                        });
                        break;
                }
            });
            socket.on("invite", (invite: ChannelInvite) => {
                setChannelInvites((invites) => [...invites, invite]);
            });
            socket.on("cancelInvite", (invite: ChannelInvite) => {
                setChannelInvites((invites) => invites.filter((i: ChannelInvite) => i.channel.id !== invite.channel.id));
            });
            socket.on("acceptInvite", (invite: ChannelInvite) => {
                // Remove the invite from the list of invites
                setChannelInvites((invites) => invites.filter((i: ChannelInvite) => i.channel.id !== invite.channel.id));
                // Add the channel to the list of channels
                setChannels((channels) => [...channels, invite.channel]);
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
                socket.off("offline");
                socket.off("unbanned");
                socket.off("unmuted");
                socket.off("blocked");
                socket.off("unblocked");
                socket.off("dmMessage");
                socket.off("updateOwner");
                socket.off("punishment");
                socket.off("invite");
                socket.off("cancelInvite");
                socket.off("acceptInvite");
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
            selectedChannel,
            setSelectedChannel,
            channelInvites,
            setChannelInvites,
            publicChannels,
            setPublicChannels,
            privateChannels,
            setPrivateChannels,
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
