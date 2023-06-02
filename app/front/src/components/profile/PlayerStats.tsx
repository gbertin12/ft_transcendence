import { Text, Card, Row } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/user.interface";

function EloLabel({ elo }: { elo: number }) {
    const [ color, setColor ] = useState<string>("primary");

    useEffect(() => {
        if (elo > 1000) setColor("success");
        else if (elo < 1000) setColor("error");
    }, [color]);

    return (
        <Text h4 color={color}>{elo}</Text>
    );
}

export default function PlayerStats({ user }: { user: User }) {

    return (
        <Card>
            <Card.Header>
                <Text h2>Player Stats</Text>
            </Card.Header>

            <Card.Divider/>

            <Card.Body>
                <Row justify="space-between" align="center">
                    <Text h4>Wins</Text>
                    <Text h4>{user.wins}</Text>
                </Row>

                <Row justify="space-between" align="center">
                    <Text h4>Losses</Text>
                    <Text h4>{user.losses}</Text>
                </Row>

                <Row justify="space-between" align="center">
                    <Text h4>Elo</Text>
                    <EloLabel elo={user.elo}/>
                </Row>
            </Card.Body>
        </Card>
    );
}
