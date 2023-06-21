import SignIn from './SignIn';
import SignUp from './SignUp';
import ConnectedButton from '@/components/auth/ConnectedButton';

import React from "react";
import { Modal, Button, Text, Input, Grid } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';


export default function ModalSign() {
	const { user } = useUser();
	const userId = user?.id

	const [visible, setVisible] = React.useState(false);
	const handler = () => setVisible(true);

	const closeHandler = () => {
		setVisible(false);
		console.log("closed");
	};

	return (
		<div>
			{
			!userId ?
				<Button auto onPress={handler}>
					<Text bold color="secondary">Se connecter </Text>
				</Button>
				:
				<ConnectedButton/>
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
								<SignIn closeModal={closeHandler} />
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
