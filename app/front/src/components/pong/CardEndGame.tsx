import React from 'react';
import { useState } from 'react';
import {Card, Grid, Text, Button, Row, Col, Avatar} from "@nextui-org/react"


function DisplayNewElo({win, elo, pts} : {win: boolean, elo: number, pts: number})
{
	let color = "rgba(0, 200, 0, 10.8)";
	let operator = "";
	
	if (win)
	{
		operator = " + " + pts;
		elo += pts;
	}
	else
	{
		elo -= pts;
		if (elo < 0)
			elo = 0;
		color = "rgba(255, 0, 0, 0.8)";
		operator = " - " + pts;
	}
	return (
		<>
			<Text color={color}>{elo}{operator}</Text>
		</>
	)
	
}


function PlayerInfos ({win, score, username, avatar} : {win: boolean, score: number, username: string, avatar: string}) {
	let color = "success";
	if (!win)
		color = "error"
	return (
		<>
			<Avatar 
				bordered 
				size='xl' 
				css={{ mx:'auto'}} 
				src={avatar}
				color={color}
			/>
			<Text css={{mt:"5px", ta:'center', mb:"0px"}} h4>{username}</Text>
			<DisplayNewElo 
				win={win}
				elo={1200}
				pts={15}
			/>
			<Text css={{mt:"5px", ta:'center'}} h3 >{score} pts</Text>
		</>
	)
}


export default function CardEndGame({win, score1, score2, handleCloseCardEndGame} : {win: boolean, score1: number, score2: number, handleCloseCardEndGame: () => void}) {
	return <> 
		<Card css={{ w: "400px" }}>
			<Card.Header css={{jc:'center', }}>
				<Text h2 b>YOU { win ? "WIN !" : "LOOSE !"}</Text>
			</Card.Header>
			<Card.Divider />
			<Card.Body css={{ py: "$10" }}>
				<Grid.Container gap={2} justify='center' alignItems='center'>
					<Grid justify='center'>
						<PlayerInfos
							win={win}
							score={score1}
							username='gbertin'
							avatar='https://i.imgur.com/fjZQLH6.png'
						/>
					</Grid>
					<Grid ><Text css={{mx: "15px"}} h1 b> - </Text></Grid>
					<Grid>
						<PlayerInfos
							win={!win}
							score={score2}
							username='Adversary'
							avatar='https://i.imgur.com/pLGJ0Oj.jpeg'
						/>
					</Grid>
				</Grid.Container>
			</Card.Body>
			<Card.Divider />
			<Card.Footer css={{jc:'center'}}>
				<Button onClick={handleCloseCardEndGame} bordered  size="sm">Close</Button>
			</Card.Footer>
		</Card>
	</>
}