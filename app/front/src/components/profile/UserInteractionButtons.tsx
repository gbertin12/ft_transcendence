import { User } from "@/interfaces/user.interface";
import { Button, Row } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IconUserMinus, IconUserPlus, IconSwords, IconUserCancel, IconUserCheck, IconUserX } from '@tabler/icons-react';
import axios from 'axios';
import { useChat } from "@/contexts/chat.context";
import { FriendRequest } from "@/interfaces/chat.interfaces";

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
                    <IconUserCheck />
                </Button>

                <Button
                    size="sm"
                    auto
                    onPress={() => handleDeclineFriendRequest(user.id)}
                    color="error">
                    <IconUserX />
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
    const { friends, receivedRequests, sentRequests } = useChat();
    const [ isFriend, setIsFriend ] = useState<boolean>(false);

    useEffect(() => {
        if (friends.some((friend) => friend.userId === user.id)) {
            setIsFriend(true);
        } else {
            setIsFriend(false);
        }
    }, [friends]);

    return (
            <Row justify="space-evenly">
                {friendInteractionButton(user, sentRequests, receivedRequests, isFriend)}
                <Button size="sm" color="error" auto><IconSwords/></Button>
            </Row>
    );
}
