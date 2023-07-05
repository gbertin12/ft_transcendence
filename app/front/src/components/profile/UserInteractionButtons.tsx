import { User } from "@/interfaces/user.interface";
import { Button, Row } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IconUserMinus, IconUserPlus, IconSwords, IconUserCancel, IconUserCheck, IconUserX, IconUser, IconUserOff } from '@tabler/icons-react';
import axios from 'axios';
import { useChat } from "@/contexts/chat.context";
import { FriendRequest } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import { PlayerInterface } from "@/interfaces/pong.interface";
import { useNotif } from "@/contexts/notif.context";

function handleAddFriend(to: number) {
    axios.post('http://localhost:3000/friends/add', { to }, {
        withCredentials: true,
        validateStatus: () => true,
    });
}

function handleRemoveFriend(id: number) {
    axios.delete(`http://localhost:3000/friends/${id}`, {
        withCredentials: true,
        validateStatus: () => true,
    });
}

function handleCancelFriendRequest(id: number) {
    axios.delete(`http://localhost:3000/friends/requests/cancel/${id}`, {
        withCredentials: true,
        validateStatus: () => true,
    });
}

function handleAcceptFriendRequest(id: number) {
    axios.post(`http://localhost:3000/friends/requests/${id}/accept`, {}, {
        withCredentials: true,
        validateStatus: () => true,
    });
}

function handleDeclineFriendRequest(id: number) {
    axios.delete(`http://localhost:3000/friends/requests/${id}`, {
        withCredentials: true,
        validateStatus: () => true,
    });
}

function friendInteractionButton(
    user: User,
    sentRequests: FriendRequest[],
    receivedRequests: FriendRequest[],
    isFriend: boolean
): JSX.Element {
    const sent = sentRequests.some((request) => request.receiver_id === user.id);
    const recieved = receivedRequests.some((request) => request.sender_id === user.id);

    if (isFriend) {
        return (
            <Button
                size="sm"
                auto
                onPress={() => handleRemoveFriend(user.id)}
                color="warning">
                <IconUserMinus/>
            </Button>
        );
    }
    // Return the cancel button if the user has sent a request and is the sender
    else if (sent) {
        return (
            <Button
                size="sm"
                auto
                onPress={() => handleCancelFriendRequest(user.id)}
                color="warning">
                <IconUserCancel/>
            </Button>
        );
    }
    // Return the accept/decline buttons if the user has sent a request and is the receiver
    else if (recieved) {
        return (
            <Row justify="space-evenly">
                <Button
                    size="sm"
                    auto
                    onPress={() => handleAcceptFriendRequest(user.id)}
                    color="success">
                    <IconUserCheck/>
                </Button>

                <Button
                    size="sm"
                    auto
                    onPress={() => handleDeclineFriendRequest(user.id)}
                    color="error">
                    <IconUserOff/>
                </Button>
            </Row>
        );
    }
    // Return the add button if the user is not a friend and has not sent a request
    else {
        return (
            <Button
                size="sm"
                auto
                onPress={() => handleAddFriend(user.id)}
                color="success">
                <IconUserPlus/>
            </Button>
        );
    }
}

export default function UserInteractionButtons({ user }: { user: User }) {
    const { friends, receivedRequests, sentRequests, blockedUsers } = useChat();
    const [ isBlocked, setIsBlocked ] = useState<boolean>(false);
    const [ isFriend, setIsFriend ] = useState<boolean>(false);
    const { socket } = useUser();
    const { canRequest, setCanRequest } = useNotif();
    const [ player, setPlayer ] = useState<PlayerInterface>({} as PlayerInterface);

    function handleBlockUser() {
        axios.post(`http://localhost:3000/friends/block/${user.id}`, {}, {
            withCredentials: true,
            validateStatus: () => true,
        });
    }

    function handleUnblockUser() {
        axios.post(`http://localhost:3000/friends/unblock/${user.id}`, {}, {
            withCredentials: true,
            validateStatus: () => true,
        });
    }

    useEffect(() => {
        axios.get(`http://localhost:3000/user/player/${user.id}`)
            .then((res) => {
                setPlayer(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        setIsBlocked(blockedUsers.has(user.id));
    }, [blockedUsers]);

    useEffect(() => {
        setIsFriend(
            friends.some((friend) => friend.userId === user.id)
        );
    }, [friends]);

    async function handleDuelRequest() {
        socket.emit('duelRequest', user.id);
        setCanRequest(false);
    }

    return (
        <Row justify="space-evenly">
            {friendInteractionButton(user, sentRequests, receivedRequests, isFriend)}

            {(isBlocked) ? (
                <Button
                    onPress={handleUnblockUser}
                    size="sm"
                    color="success"
                    auto>
                    <IconUser/>
                </Button>
                ) : (
                <Button
                    onPress={handleBlockUser}
                    size="sm"
                    color="error"
                    auto>
                    <IconUserX/>
                </Button>
            )}

            {(!canRequest || player.state !== 0) ? (
                <Button
                    disabled
                    size="sm"
                    color="primary"
                    auto>
                    <IconSwords/>
                </Button>) : (
                <Button
                    onPress={handleDuelRequest}
                    size="sm"
                    color="primary"
                    auto>
                    <IconSwords/>
                </Button>
            )}
        </Row>
    );
}
