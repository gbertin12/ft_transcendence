import React, { useEffect, useState } from 'react';
import { Button, Popover, Grid, Card, Text, Image, Row, Spacer } from '@nextui-org/react'
import { useUser } from '@/contexts/user.context';
import { IconQuestionMark, IconSquareArrowUp, IconSquareArrowDown } from '@tabler/icons-react';

function ContentHints() {
	return <>
		<Card css={{w:"300px"}}>
			<Card.Header>
				<Grid.Container justify='center' alignItems='center'>
					<Grid>
						<Text h2>HINTS</Text>
						<Card.Divider />
					</Grid>
				</Grid.Container>
			</Card.Header>
			<Card.Body>
				<Grid.Container >
					<Grid>
						<Row>
							<Image 
								src="/power.png"
								width={40}
								height={40}
								alt={"speed Up"}
							/>
							<Text><b>Speed Up</b> : boost speed Ball</Text>
						</Row>
						<Spacer/>
						<Row>
							<Image css={{mx:"10px"}}
								src="/bounce.png"
								width={40}
								height={40}
								alt={"speed Up"}
							/>
							<Text css={{mr:"5px"}} ><b>Bounce</b> : Ball change direction</Text>
						</Row>	
						<Spacer />					
						<Row>
							<IconSquareArrowUp 
							style={{
								marginRight: "1em",
								marginLeft: "0.8em"
							}}/>
							<Text>Move your paddle up </Text>
						</Row>
						<Spacer />					
						<Row>
							<IconSquareArrowDown 
							style={{
								marginRight: "1em",
								marginLeft: "0.8em"
							}}/>
							<Text>Move your paddle down </Text>
						</Row>
					</Grid>
				</Grid.Container>
			</Card.Body>
 		</Card>
	</>
}

export default function ButtonHintGame() {

		return <>
      	<Grid>
        	<Popover>
        	  	<Popover.Trigger>
        	    	<IconQuestionMark 
					size={30}
					cursor="pointer"
					style={{
						transform: "translateY(20%)",
					}}
					color='yellow'
					/>
        	  	</Popover.Trigger>
        	  	<Popover.Content>
					<ContentHints />
        	  	</Popover.Content>
        	</Popover>
      	</Grid>
	</>
}
