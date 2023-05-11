import { Button, Text, Grid, Pagination , Table, Avatar, Loading, Row} from "@nextui-org/react";
import { useEffect, useState } from "react";
import  { GameData, MatchHistoryRow }  from "@/interfaces/profile.interface"
import { User } from "@/interfaces/user.interface";

function generateRow(game: any, victory: boolean, id: number): MatchHistoryRow {
    let row: MatchHistoryRow = {
        id,
        victory,
        winnerScore: game.winnerScore,
        looserScore: game.looserScore,
        opponentName: "",
        avatar: "",
        elo: 0,
    };

    if (victory) {
        row.opponentName = game.looser.name;
        row.avatar = game.looser.avatar;
    } else {
        row.opponentName = game.winner.name;
        row.avatar = game.winner.avatar;
    }

    return row;
}

function setDataRows(gamesWon: GameData[], gamesLost: GameData[]) {
    let rows: MatchHistoryRow[] = [];

    let w = 0, l = 0;
    let id = 0;
    while (w < gamesWon.length && l < gamesLost.length) {
        if (gamesWon[w].id > gamesLost[l].id) {
            const row = generateRow(gamesWon[w], true, id++);
            rows.push(row);
            w++; 
        } else {
            const row = generateRow(gamesLost[l], false, id++);
            rows.push(row);
            l++;
        }
    }

    return (rows);
}

export default function MatchHistory({ user }: { user: User }) {
    const [ rows, setRows ] = useState<MatchHistoryRow[]>([]);

    useEffect(() => {
        (async () => {
            const res = await fetch(`http://localhost:3000/user/history/${user.name}`);
            const data = await res.json();
            console.log(data);
            setRows(setDataRows(data.gamesWon, data.gamesLost));
        })();
    }, []);

    if (!rows) return <Loading/>

    return (
        <Grid.Container direction="column" justify="center">
            <Grid>
                <Text h4 color="primary">Match History</Text>
            </Grid>
            <Grid>
                <Table
                    striped
                    aria-label="Match History">
                    <Table.Header>
                        <Table.Column css={{ ta: "center" }} key={1}>MODE</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={2}>AVATAR</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={3}>USERNAME</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={4}>ELO</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={5}>SCORE</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={6}>ELO</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={7}>USERNAME</Table.Column>
                        <Table.Column css={{ ta: "center" }} key={8}>AVATAR</Table.Column>
                    </Table.Header>
                    <Table.Body items={rows}>
                        {(item) => (
                            <Table.Row css={{ ta: "center" }} key={item.id}>
                                <Table.Cell>MODE</Table.Cell>
                                <Table.Cell>
                                    <Row justify="center" align="center">
                                        <Avatar
                                            bordered
                                            color={(item.victory) ? "success" : "error"}
                                            src={`http://localhost:3000/static/avatars/${user.avatar}`} />
                                    </Row>
                                </Table.Cell>
                                <Table.Cell>{user.name}</Table.Cell>
                                <Table.Cell>{user.elo}</Table.Cell>
                                <Table.Cell>{(item.victory) ? item.winnerScore : item.looserScore} - {(item.victory) ? item.looserScore : item.winnerScore}</Table.Cell>
                                <Table.Cell>{item.elo}</Table.Cell>
                                <Table.Cell>{item.opponentName}</Table.Cell>
                                <Table.Cell>
                                    <Row justify="center" align="center">
                                        <Avatar
                                            bordered
                                            color={(item.victory ? "error" : "success")}
                                            src={`http://localhost:3000/static/avatars/${item.avatar}`} />
                                    </Row>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                    <Table.Pagination
                        align="start"
                        rowsPerPage={4}/>
                </Table>
            </Grid>
        </Grid.Container>
    );
}