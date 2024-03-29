import React from 'react';
import { Avatar, Card, Row, Spacer, Text, Col, Grid, Loading } from '@nextui-org/react';
import styles from '../../styles/pong.module.css'

export default function CardPlayerInformation({searchGame, username, avatar, elo, nbWin, nbLoose} : 
	{searchGame:boolean, username: string, avatar: string, elo: number, nbWin: number, nbLoose: number}) 
{
	if (!searchGame)
	{
		return <>
			<Card isHoverable css={{w:"200px"}}>
				<Card.Body>
					<Grid.Container gap={2} justify='center' alignItems='center'>
						<Grid>
							<Avatar css={{ mx:'auto'}} src={avatar} size="xl" />
							<Text css={{ ta:'center'}}  h3>{username}</Text>
							<Text css={{ ta:'center'}}  h6>elo : {elo}</Text>
						</Grid>
					</Grid.Container>
				</Card.Body>
				<Card.Divider />
				<Card.Footer>
					<Row justify='center'>
						<Text color="success" h5>{nbWin}</Text>
						<Spacer x={1} />
						<Text h5>-</Text>
						<Spacer x={1} />
						<Text color="error" h5>{nbLoose}</Text>
					</Row>
				</Card.Footer>		
			</Card>
		</>
	}
	else
	{
		return <>
			<div className={styles.parentCardBlur}>
				<div className={styles.childCardBlurLoader}>
					<Loading size='xl' type='spinner' color="warning"/>
				</div>
				<div className={styles.cardBlur}>
					<Card isHoverable css={{w:"200px"}}>
						<Card.Body>
							<Grid.Container gap={2} justify='center' alignItems='center'>
								<Grid>
									<Avatar css={{ mx:'auto'}} src={avatar} size="xl" />
									<Text css={{ ta:'center'}}  h3>{username}</Text>
									<Text css={{ ta:'center'}}  h6>elo : {elo}</Text>
								</Grid>
							</Grid.Container>
						</Card.Body>
						<Card.Divider />
						<Card.Footer>
							<Row justify='center'>
								<Text color="success" h5>{nbWin}</Text>
								<Spacer x={1} />
								<Text h5>-</Text>
								<Spacer x={1} />
								<Text color="error" h5>{nbLoose}</Text>
							</Row>
						</Card.Footer>		
					</Card>
				</div>
			</div>
		</>
	}
}