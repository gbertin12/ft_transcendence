import { User } from "@/interfaces/user.interface";
import { Avatar, Button, Grid, Row, Tooltip, Text } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IconUserMinus, IconUserPlus, IconSwords, IconX, IconUserOff } from '@tabler/icons-react';
import axios from 'axios';
import { useChat } from "@/contexts/chat.context";
import { Friend, FriendRequest } from "@/interfaces/chat.interfaces";
import { IconUserX } from "@tabler/icons-react";

function handleAddFriend(id: number) {
    axios.post('http://localhost:3000/friends/add', { to: id }, {
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

function friendInteractionButton(user: User, requests: FriendRequest[], isFriend: boolean): JSX.Element {
    // Return the remove button if the user is a friend
    let pendingFriendRequest = requests.find((request) => request.sender_id == user.id);

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
    else if (pendingFriendRequest && pendingFriendRequest.sender_id == user.id) {
        return (
            <Button
                size="sm"
                auto
                onPress={() => handleRemoveFriend(user.id)}
                color="warning">
                <IconUserX/>
            </Button>
        );
    }
    // Return a decline button if the user has sent a request and is the receiver
    else if (pendingFriendRequest && pendingFriendRequest.receiver_id == user.id) {
        return (
            <Button
                size="sm"
                auto
                onPress={() => handleRemoveFriend(user.id)}
                color="error">
                <IconUserOff />
            </Button>
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

function ProfileTooltip({ user }: { user: User }) {
    const { friends, friendRequests } = useChat();
    const [ winrate, setWinrate ] = useState<number>(-1);
    const [ isFriend, setIsFriend ] = useState<boolean>(false);

    useEffect(() => {
        if (user.wins + user.losses > 0) {
            setWinrate(Math.round(user.wins / (user.wins + user.losses) * 100));
        }
    }, [user.wins, user.losses]);

    useEffect(() => {
        console.log(friends);

        if (friends.some((friend) => friend.userId == user.id)) {
            setIsFriend(true);
        } else {
            setIsFriend(false);
        }
    }, [friends]);

    return (
        <Grid.Container
            css={{
                maxWidth: "260px",
            }}>
            <Row justify="center" align="center">
                <Text h4>{user.name}</Text>
            </Row>

            <Row justify="space-between">
                <Text>Elo</Text>
                <Text>{user.elo}</Text>
            </Row>

            {(winrate != -1) && (<Row justify="space-between">
                <Text>Win Rate</Text>
                <Text>{winrate}%</Text>
            </Row>)}

            <Row justify="space-evenly">
                <Grid>
                    {friendInteractionButton(user, friendRequests, isFriend)}
                </Grid>
                <Grid>
                    <Button size="sm" color="error" auto><IconSwords/></Button>
                </Grid>
            </Row>
        </Grid.Container>
    );
}

export default function AvatarTooltip({ user, placement }: { user: User, placement: any }) {
    return (
        <Tooltip
            placement={placement}
            content={<ProfileTooltip user={user}/>}>
            <Avatar
                src={`http://localhost:3000/static/avatars/${user.avatar}`}
            />
        </Tooltip>
    );
}
