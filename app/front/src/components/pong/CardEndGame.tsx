import React from 'react';
import {Card, Grid, Text, Button, Avatar, Badge, Container } from "@nextui-org/react"
import { useUser } from '@/contexts/user.context';
import { PlayerEndGame, PlayerInterface } from '@/interfaces/pong.interface';

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

export default function CardEndGame({endGame, roomName, handleCloseCardEndGame} 
    : { endGame: PlayerEndGame, roomName : string, handleCloseCardEndGame: () => void}) {
    const { user, socket } = useUser();

    let badgeContent1: string = "";
    let badgeContent2: string = "";
    const playerId = endGame.id;
    let player1 = {} as PlayerInterface;
    let player2 = {} as PlayerInterface;
    let win: boolean;
    let title: string;

    socket.emit('leaveRoom', roomName);

    if (playerId == 1) {
        player1 = endGame.room.pongState.player1;
        player2 = endGame.room.pongState.player2;
    } else {
        player1 = endGame.room.pongState.player2;
        player2 = endGame.room.pongState.player1;
    }

    if (player1.score > player2.score) {
        badgeContent1 = "+" + endGame.eloDiff;
        badgeContent2 = "-" + endGame.eloDiff;
        win = true;
        title = "YOU WON !";
    } else {
        badgeContent2 = "+" + endGame.eloDiff;
        badgeContent1 = "-" + endGame.eloDiff;
        win = false;
        title = "YOU LOST !";
    }

    if (endGame.forfeit) {
        title = "Your opponent has forfeited";
    }

    return (
        <Card >
            <Card.Header css={{jc:'center', }}>
                <Text h2 b>{title}</Text>
            </Card.Header>

            <Card.Divider />

            <Card.Body css={{ py: "$10" }}>
                <Grid.Container gap={2} justify='center' alignItems='center'>
                    <PlayerInfos
                        win={win}
                        score={player1.score}
                        username={user.name}
                        avatar={user.avatar}
                        badgeContent={badgeContent1}
                        newElo={user.elo}
                    />
                    <Grid>
                        <Text css={{mx: "15px"}} h1 b> - </Text>
                    </Grid>

                    <Grid>
                        <PlayerInfos
                            win={!win}
                            score={player2.score}
                            username={player2.userInfos.name}
                            avatar={player2.userInfos.avatar}
                            badgeContent={badgeContent2}
                            newElo={player2.userInfos.elo}
                        />
                    </Grid>
                </Grid.Container>
            </Card.Body>

            <Card.Divider />

            <Card.Footer css={{jc:'center'}}>
                <Button onClick={handleCloseCardEndGame} bordered  size="sm">Close</Button>
            </Card.Footer>
        </Card>
    );
}
