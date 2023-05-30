import { Modal, Button, Text, Input, Grid, Pagination , Table, Avatar} from "@nextui-org/react";
import { useEffect, useState, useMemo } from "react";
import  { User, RowLeaderboard }  from "@/interfaces/user.interface"

function RowsLeaderboard({users} : {users: User[]}) {

	return <>
		<Table.Row key="1">
          	<Table.Cell>Tony Reichert</Table.Cell>
          	<Table.Cell>CEO</Table.Cell>
          	<Table.Cell>Active</Table.Cell>
          	<Table.Cell>Active</Table.Cell>
          	<Table.Cell>Active</Table.Cell>
        </Table.Row>
	</>
}


function setDataRow(users : User[]) {
	let rowsLeaderboard : RowLeaderboard[] = [];
	let id : number = 0;
	users.map(user => {
		const winrate : number = user.wins / (user.wins + user.losses) * 100
		let newRow : RowLeaderboard = {
			rank : id,
			avatar: user.avatar,
			name: user.name,
			winrate: winrate,
			elo: user.elo
		}
		rowsLeaderboard.push(newRow);
		id++;
	})
	console.log(rowsLeaderboard, "false")
	return (rowsLeaderboard);
}

export default function Leaderboard() {
	const [users, setUsers] = useState<User[]>([]);
	const [rowsLeaderboard, setRowsLeaderboard] = useState<RowLeaderboard[]>([]);
	const [loading, setLoading] = useState<Boolean>(true);

	
	useEffect(() => {
        fetch("http://localhost:3000/user/leaderboard")
            .then((res) => res.json())
            .then((data) => {
				console.log(data)
                setUsers(data);
				setRowsLeaderboard(setDataRow(users))
				console.log(rowsLeaderboard, "good")
                setLoading(false);
            });
    }, []);

	const memoizedData = useMemo(() => users, [users]);

	const columns = [
		{
		  key: "rank",
		  label: "RANK",
		},
		{
		  key: "avatar",
		  label: "AVATAR",
		},
		{
			key: "name",
			label: "NAME",
		  },
		{
		  key: "winrate",
		  label: "WIN RATE",
		},
		{
			key: "elo",
			label: "ELO",
		},
	];


	
  	return <>
		{memoizedData ? 
		(
			<Grid>
				<p>Data: {JSON.stringify(memoizedData)}</p>
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
							}}
    					>
    					<Table.Header columns={columns}>
							<Table.Column>RANK</Table.Column>
        					<Table.Column>AVATAR</Table.Column>
        					<Table.Column>NAME</Table.Column>
        					<Table.Column>WIN RATE</Table.Column>
        					<Table.Column>ELO</Table.Column>
    					</Table.Header>
						<Table.Body items={rowsLeaderboard}>
						{(item) => (
          					<Table.Row key={item.rank}>
            					{(columnKey) => <Table.Cell>{item[columnKey]}</Table.Cell>}
          					</Table.Row>
        				)}
						</Table.Body>
						<Table.Pagination
    					    align="center"
    					    rowsPerPage={9}
    					    onPageChange={(page) => console.log({ page })} />
    					</Table>
					</Grid>
				</Grid.Container>
  			</Grid>
		) : (
			<p>Loading...</p>
		)}
	</>
}