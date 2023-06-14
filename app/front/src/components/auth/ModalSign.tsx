import SignIn from './SignIn';
import SignUp from './SignUp';
import AvatarTooltip from '@/components/profile/AvatarTooltip';

import React from "react";
import { Modal, Button, Text, Input, Grid } from "@nextui-org/react";
import  { User } from "@/interfaces/user.interface";
import { useUser } from '@/contexts/user.context';


export default function ModalSign(){
	const {user}  = useUser();
	console.log(user);
	const userId = user?.id
	const [visible, setVisible] = React.useState(false);
	const handler = () => setVisible(true);

	const closeHandler = () => {
		setVisible(false);
		console.log("closed");
	};

	return (
		<div>{
		!userId ?
		<Button auto onPress={handler}>
			<Text bold color="secondary">Se connecter </Text>
		</Button>
		:
		<AvatarTooltip user={user} placement="bottom"/>
		}
			<Modal closeButton
				blur
				aria-labelledby="SignIn"
				width="80%"
				open={visible}
				onClose={closeHandler}
			>
				<Modal.Body>
					<Grid direction="row" >
						<Grid.Container justify='center' gap={4} >
							<Grid>
								<SignIn />
							</Grid>
							<Grid>
								<SignUp />
							</Grid>
						</Grid.Container>
					</Grid>
				</Modal.Body>
			</Modal>
		</div>
	);
}
//
