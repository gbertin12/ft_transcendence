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
					<Text color="secondary">Se connecter </Text>
				</Button>
				:
				<ConnectedButton/>
			}
			<Modal closeButton
				blur
				aria-labelledby="SignIn"
				width="60%"
				open={visible}
				onClose={closeHandler}
			>
				<Modal.Body>
						<Grid.Container justify='center' gap={4} >
							<Grid>
								<SignIn />
							</Grid>
							<Grid>
								<SignUp />
							</Grid>
						</Grid.Container>
				</Modal.Body>
			</Modal>
		</div>
	);
}
