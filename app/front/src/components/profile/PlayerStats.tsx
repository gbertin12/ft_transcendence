import { Text, Row, Grid } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/user.interface";

function EloLabel({ elo }: { elo: number }) {
    const [ color, setColor ] = useState<string>("primary");

    useEffect(() => {
        if (elo > 1000) setColor("success");
        else if (elo < 1000) setColor("error");
    }, [elo]);

    return (
        <Text h4 color={color}>{elo}</Text>
    );
}

export default function PlayerStats({ user }: { user: User }) {
    const [ winrate, setWinrate ] = useState<number>(-1);

    useEffect(() => {
        if (user.wins + user.losses > 0) {
            setWinrate(Math.round(user.wins / (user.wins + user.losses) * 100));
        }
    }, [user.wins, user.losses]);


    return (
        <Grid>
            <Row justify="space-between" align="center">
                <Text h4>Wins</Text>
                <Text h4>{user.wins}</Text>
            </Row>

            <Row justify="space-between" align="center">
                <Text h4>Losses</Text>
                <Text h4>{user.losses}</Text>
            </Row>

            {(winrate !== -1) && (<Row justify="space-between" align="center">
                <Text h4>Winrate</Text>
                <Text h4>{winrate}%</Text>
            </Row>)}

            <Row justify="space-between" align="center">
                <Text h4>Elo</Text>
                <EloLabel elo={user.elo}/>
            </Row>
        </Grid>
    );
}
