import SignIn from './SignIn';
import SignUp from './SignUp';
import React from "react";
import { Modal, Button, Text, Input, Grid } from "@nextui-org/react";

export default function App() {
	const [visible, setVisible] = React.useState(false);
	const handler = () => setVisible(true);

	const closeHandler = () => {
		setVisible(false);
		console.log("closed");
	};

	return (
		<div>
			<Button auto onPress={handler}>
				<Text color="secondary">Se connecter </Text>
			</Button>
			<Modal closeButton
				blur
				aria-labelledby="SignIn"
				width="80%"
				open={visible}
				onClose={closeHandler}
			>
				<Modal.Body >
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
