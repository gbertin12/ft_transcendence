import { Button, Text, Grid, Table } from "@nextui-org/react";
import { useEffect, useState } from "react";
import  { User, RowLeaderboard }  from "@/interfaces/user.interface"
import { useRouter } from "next/router";
import AvatarTooltip from "@/components/profile/AvatarTooltip";

function DisplayLeaderboard({rowsLeaderboard} : {rowsLeaderboard: RowLeaderboard[]}) {
    const router = useRouter();

    return (
        <Grid.Container direction="column" justify="center">
            <Grid>
                <Text h4 color="primary" >Leaderboard</Text>
            </Grid>
            <Grid>
                <Table
                    striped
                    aria-label="Leaderboard"
                    css={{
                        height: "auto",
                        minWidth: "100%",
                    }}>
                    <Table.Header>
                        <Table.Column key={1}>RANK</Table.Column>
                        <Table.Column key={2}>AVATAR</Table.Column>
                        <Table.Column key={3}>NAME</Table.Column>
                        <Table.Column key={4}>WIN RATE</Table.Column>
                        <Table.Column key={5}>ELO</Table.Column>
                        <Table.Column key={6}>ACTION</Table.Column>
                    </Table.Header>
                    <Table.Body items={rowsLeaderboard}>
                        {(item) => (
                            <Table.Row key={item.rank}>
                                <Table.Cell>{item.rank}</Table.Cell>
                                <Table.Cell><AvatarTooltip user={item.user} placement="top" /></Table.Cell>
                                <Table.Cell>{item.user.name}</Table.Cell>
                                <Table.Cell>{item.winrate}%</Table.Cell>
                                <Table.Cell>{item.user.elo}</Table.Cell>
                                <Table.Cell>
                                    <Button onPress={() => router.push(`/user/${item.user.name}`)}>Profile</Button>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                    <Table.Pagination
                        align="center"
                        rowsPerPage={12}/>
                </Table>
            </Grid>
        </Grid.Container>
    )
}

function setDataRow(users : User[]) {
    let rowsLeaderboard : RowLeaderboard[] = [];
    let id : number = 1;
    users.map(user => {
        let winrate : number = Math.round(user.wins / (user.wins + user.losses) * 100);

        if (!winrate) winrate = 0;
        let newRow : RowLeaderboard = {
            rank : id,
            user,
            winrate
        }
        rowsLeaderboard.push(newRow);
        id++;
    })
    return (rowsLeaderboard);
}

export default function Leaderboard() {
    const [rowsLeaderboard, setRowsLeaderboard] = useState<RowLeaderboard[]>([]);

    useEffect(() => {
        fetch("http://localhost:3000/user/leaderboard")
            .then((res) => res.json())
            .then((data) => {
                setRowsLeaderboard(setDataRow(data))
            });
    }, []);

    return (
        <Grid>
            <DisplayLeaderboard rowsLeaderboard={rowsLeaderboard}/>
        </Grid>
    );
}
