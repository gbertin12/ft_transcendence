import { User } from "@/interfaces/user.interface";
import { Avatar, Button, Grid, Row, Tooltip, Text } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IconUserMinus, IconUserPlus, IconSwords } from '@tabler/icons-react';
import axios from 'axios';
import { useChat } from "@/contexts/chat.context";

function ProfileTooltip({ user }: { user: User }) {
    const { friends } = useChat();
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

    function handleAddFriend(id: number) {
        axios.post('http://bess-f1r2s10:3000/friends/add', { to: id }, {
            withCredentials: true,
            validateStatus: () => true,
        });
    }

    function handleRemoveFriend(id: number) {
        axios.delete(`http://bess-f1r2s10:3000/friends/${id}`, {
            withCredentials: true,
            validateStatus: () => true,
        });
    }

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
                {(isFriend) ? (<Grid>
                    <Button
                        size="sm"
                        auto
                        onPress={() => handleRemoveFriend(user.id)}
                        color="warning">
                        <IconUserMinus/>
                    </Button>
                </Grid>) :
                (<Grid>
                    <Button
                        size="sm"
                        auto
                        onPress={() => handleAddFriend(user.id)}
                        color="success">
                        <IconUserPlus/>
                    </Button>
                </Grid>)}

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
                src={`http://bess-f1r2s10:3000/static/avatars/${user.avatar}`}
            />
        </Tooltip>
    );
}
