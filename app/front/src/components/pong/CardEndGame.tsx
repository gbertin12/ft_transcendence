import React from 'react';
import { useState } from 'react';
import {Card, Grid, Text, Button, Row, Col, Avatar, Badge } from "@nextui-org/react"


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
			<Text css={{ ta:'center' }} color={color}>{elo}{operator}</Text>
		</>
	)
	
}


function PlayerInfos ({win, score, username, avatar} : {win: boolean, score: number, username: string, avatar: string}) {
	let color: String = "success";
	let badgeContent: String = "+15";
	if (!win)
	{
		badgeContent = "-15";
		color = "error"
	}
	return (
		<>
			<Badge disableOutline content={badgeContent} color={color} size={"sm"} css={{ m:'auto'}}>
				<Avatar 
					bordered 
					size='xl'
					css={{ m:'auto'}}
					src={avatar}
					color={color}
				/>
			</Badge>
			<Text css={{mt:"5px", ta:'center', mb:"0px", minWidth: "150px" }} h4>{username}</Text>
			<Text css={{ ta:'center' }} color={color}>1200</Text>
			<Text css={{mt:"5px", ta:'center'}} h3 >{score} pts</Text>
		</>
	)
}


export default function CardEndGame({win, score1, score2, handleCloseCardEndGame} : {win: boolean, score1: number, score2: number, handleCloseCardEndGame: () => void}) {
	return <> 
		<Card >
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
					<Grid  ><Text css={{mx: "15px"}} h1 b> - </Text></Grid>
					<Grid>
						<PlayerInfos
							win={!win}
							score={score2}
							username='AdversaryAdversary'
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