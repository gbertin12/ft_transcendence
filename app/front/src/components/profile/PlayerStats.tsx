import { Text, Card } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';
import { useEffect, useState } from "react";

function EloLabel({ elo }: { elo: number }) {
    const [ color, setColor ] = useState<string>("primary");

    useEffect(() => {
        if (elo > 1000) setColor("success");
        else if (elo < 1000) setColor("error");
    }, [color]);

    return (
        <Text h4 color={color}>Elo: {elo}</Text>
    );
}

export default function PlayerStats() {
    const { user } = useUser();

    return (
        <Card>
            <Card.Header>
                <Text h2>Player Stats</Text>
            </Card.Header>

            <Card.Divider/>

            <Card.Body>
                <Text h4>Wins: {user.wins}</Text>
                <Text h4>Losses: {user.losses}</Text>
                <EloLabel elo={user.elo}/>
            </Card.Body>
        </Card>
    );
}
