import { Modal, Button, Text, Input, Grid, Pagination, Table, Avatar } from "@nextui-org/react";


export default function SignIn() {
	return (
		<Grid>
			<Grid.Container direction="column" justify="center">
				<Grid>

					<Text h4 color="primary" >Leaderboard</Text>
				</Grid>

				<Grid>

					<Table
						aria-label="Leaderboard"
						css={{
							height: "auto",
							minWidth: "100%",
						}}
					>
						<Table.Header>
							<Table.Column>Rank</Table.Column>
							<Table.Column>Avatar</Table.Column>
							<Table.Column>Username</Table.Column>
							<Table.Column>Win Rate</Table.Column>
							<Table.Column>ELO</Table.Column>
						</Table.Header>
						<Table.Body>
							<Table.Row key="1">
								<Table.Cell>1</Table.Cell>
								<Table.Cell>
									<Avatar
										squared
										src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
								</Table.Cell>
								<Table.Cell >Tony Reichert</Table.Cell>
								<Table.Cell>100%</Table.Cell>
								<Table.Cell>125</Table.Cell>
							</Table.Row>
							<Table.Row key="2">
								<Table.Cell>2</Table.Cell>
								<Table.Cell>
									<Avatar
										squared
										text="Zoey" />
								</Table.Cell>

								<Table.Cell>Zoey Lang</Table.Cell>
								<Table.Cell>99%</Table.Cell>
								<Table.Cell>117</Table.Cell>
							</Table.Row>
							<Table.Row key="3">
								<Table.Cell>3</Table.Cell>

								<Table.Cell>
									<Avatar
										squared
										src="https://i.pravatar.cc/150?u=a04258114e29026702d" /></Table.Cell>
								<Table.Cell>Jane Fisher</Table.Cell>
								<Table.Cell>89%</Table.Cell>

								<Table.Cell>112</Table.Cell>
							</Table.Row>
							<Table.Row key="4">
								<Table.Cell>4</Table.Cell>

								<Table.Cell>
									<Avatar
										squared
										text="william" />
								</Table.Cell>
								<Table.Cell>William Howard</Table.Cell>

								<Table.Cell>87%</Table.Cell>
								<Table.Cell>110</Table.Cell>
							</Table.Row>
						</Table.Body>
						<Table.Pagination
							align="center"
							rowsPerPage={9}
							onPageChange={(page) => console.log({ page })} />

					</Table>
				</Grid>
			</Grid.Container>
		</Grid>
	)
}
