import React from 'react';
import { useState } from 'react';
import {Card, Grid, Text, Button, Row, Col, Avatar, Badge, Container } from "@nextui-org/react"
import { useUser } from '@/contexts/user.context';
import { User } from '../../interfaces/user.interface'

function calcElo(eloWinner: number, scoreWinner: number, eloLooser: number, scoreLooser: number): number[] {
    const p1 = eloWinner / (eloWinner + eloLooser);
    const p2 = eloLooser / (eloWinner + eloLooser);
    const k = 42 * (scoreWinner - scoreLooser);
    console.log(`K = ${k}`);
    eloWinner = eloWinner + k * (1 - p1);
    eloLooser = eloLooser + k * (0 - p2);
    return [ Math.round(eloWinner), Math.round(eloLooser), (k * (1 - p1)), (k * (0 - p2))];
}




function PlayerInfos ({win, score, username, avatar, badgeContent, newElo} : {win: boolean, score: number, username: string, avatar: string, badgeContent: string, newElo : number}) {
    let color: string = "success";
    const pathAvatar : string = "http://localhost:3000/static/avatars/" + avatar;
    if (!win)
        color = "error"
    return (
        <Grid justify='center' alignItems='center'>
            <Container fluid css={{ ta:'center' }}>
                <Badge disableOutline content={badgeContent} color={color} size={"sm"}>
                    <Avatar 
                        bordered 
                        size='xl'
                        src={pathAvatar}
                        color={color}
                    />
                </Badge>
            </Container>
            <Text css={{mt:"5px", ta:'center', mb:"0px", minWidth: "150px" }} h4>{username}</Text>
            <Text css={{ ta:'center' }} color={color}>{newElo}</Text>
            <Text css={{mt:"5px", ta:'center'}} h3 >{score} pts</Text>
        </Grid>
    )
}


export default function CardEndGame({win, score1, score2, adversary, handleCloseCardEndGame} 
    : {win: boolean, score1: number, score2: number, adversary : User, handleCloseCardEndGame: () => void}) {
    const { user } = useUser();
    
    let badgeContent1: string = "";
    let badgeContent2: string = "";
    let elo1: number = 0;
    let elo2: number = 0;

    if (score1 > score2)
    {
        let array: number[] = calcElo(user.elo, score1, adversary.elo, score2);
        elo1 = array[0];
        elo2 = array[1];
        badgeContent1 = "+" + array[2];
        badgeContent2 = "-" + array[3];
    } 
    else
    {
        const array: number[] = calcElo(adversary.elo, score2, user.elo, score1);
        elo2 = array[0];
        elo1 = array[1];
        badgeContent2 = "+" + array[2];
        badgeContent1 = "-" + array[3];
    }
    return <> 
        <Card >
            <Card.Header css={{jc:'center', }}>
                <Text h2 b>YOU { win ? "WIN !" : "LOOSE !"}</Text>
            </Card.Header>
            <Card.Divider />
            <Card.Body css={{ py: "$10" }}>
                <Grid.Container gap={2} justify='center' alignItems='center'>
                    <PlayerInfos
                        win={win}
                        score={score1}
                        username={user.name}
                        avatar={user.avatar}
                        badgeContent={badgeContent1}
                        newElo={elo1}
                    />
                    <Grid  ><Text css={{mx: "15px"}} h1 b> - </Text></Grid>
                    <Grid>
                        <PlayerInfos
                            win={!win}
                            score={score2}
                            username={adversary.name}
                            avatar={adversary.avatar}
                            badgeContent={badgeContent2}
                            newElo={elo2}
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