import { User } from "@/interfaces/user.interface";
import { Avatar, Grid, Row, Tooltip, Text } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/user.context";
import UserInteractionButtons from "./UserInteractionButtons";

function ProfileTooltip({ user }: { user: User }) {
    const [ winrate, setWinrate ] = useState<number>(-1);
    const me = useUser().user;

    useEffect(() => {
        if (user.wins + user.losses > 0) {
            setWinrate(Math.round(user.wins / (user.wins + user.losses) * 100));
        }
    }, [user.wins, user.losses]);

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

            {(me.id !== user.id) && (<UserInteractionButtons user={user}/>)}
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
