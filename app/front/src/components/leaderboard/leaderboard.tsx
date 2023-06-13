import { Modal, Button, Text, Input, Grid, Pagination , Table, Avatar, Loading} from "@nextui-org/react";
import { useEffect, useState, useMemo, Suspense } from "react";
import  { User, RowLeaderboard }  from "@/interfaces/user.interface"

function DisplayLeaderboard({rowsLeaderboard} : {rowsLeaderboard: RowLeaderboard[]}) {
	return (
		<Grid.Container>
		<Grid.Container direction="column" alignItems='center' >
				<Grid>
				<Text h2 size={20} color="primary" >Leaderboard</Text>

				</Grid>
				</Grid.Container>

				<Grid.Container direction="column" alignItems='stretch' >
				<Grid>
					<Table sticked
						aria-label="Leaderboard"
						css={{
							height: "auto",
							minWidth: "100%",
						}}
    				>
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
							<Table.Cell><Avatar src={item.avatar} /></Table.Cell>
							<Table.Cell>{item.name}</Table.Cell>
							<Table.Cell>{item.winrate}%</Table.Cell>
							<Table.Cell>{item.elo}</Table.Cell>
							<Table.Cell>
								<Button color="primary" auto ghost>VIEW</Button>
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
			</Grid.Container>
	)
}

function setDataRow(users : User[]) {
	let rowsLeaderboard : RowLeaderboard[] = [];
	let id : number = 1;
	users.map(user => {
		let winrate : number = Math.round(user.wins / (user.wins + user.losses) * 100);

		if (!winrate)
			winrate = 0;
		const pathAvatar : string = "http://localhost:3000/static/avatars/" + user.avatar;
		let newRow : RowLeaderboard = {
			rank : id,
			avatar:  pathAvatar,
			name: user.name,
			winrate: winrate,
			elo: user.elo
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

  	return <>
		<Grid>
			<DisplayLeaderboard rowsLeaderboard={rowsLeaderboard}/>
  		</Grid>
	</>
}
