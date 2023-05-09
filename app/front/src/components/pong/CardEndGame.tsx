import React from 'react';
import {Card, Grid, Text, Button, Row, Col, Avatar} from "@nextui-org/react"

export default function CardEndGame({win, score1, score2, handleCloseCardEndGame} : {win: boolean, score1: number, score2: number, handleCloseCardEndGame: () => void}) {
	return <> 
		<Card css={{ w: "400px" }}>
			<Card.Header css={{jc:'center', }}>
				<Text h1 b>YOU { win ? "WIN !" : "LOOSE !"}</Text>
			</Card.Header>
			<Card.Divider />
			<Card.Body css={{ py: "$10" }}>
				<Grid.Container gap={2} justify='center' alignItems='center'>
					<Grid justify='center'>
						<Avatar size='xl'/>
						<Text css={{mt:"5px", ta:'center'}} h4>Pseudo1</Text>
						<Text css={{mt:"5px", ta:'center'}} h3 >{score1} pts</Text>
					</Grid>
					<Grid ><Text css={{mx: "15px"}} h1 b> - </Text></Grid>
					<Grid>
						<Avatar size='xl'/>
						<Text css={{mt:"5px", ta:'center'}} h4>Pseudo2</Text>
						<Text css={{mt:"5px", ta:'center'}} h3>{score2} pts</Text>
					</Grid>
				</Grid.Container>
			</Card.Body>
			<Card.Divider />
			<Card.Footer css={{jc:'center'}}>
				<Button onClick={handleCloseCardEndGame} size="sm">Close</Button>
			</Card.Footer>
		</Card>
	</>
}