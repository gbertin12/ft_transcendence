import { Input, Spacer, Button, Grid, Text } from "@nextui-org/react";


function dummyLogin() {
	window.location.href = 'http://localhost:3000/auth/dummy';
}

export default function SignIn() {
	return (
		<Grid>
			<Text h4 color="primaryLightContrast">Sign up</Text>
			<Grid.Container direction="column">
				<Grid>

					<Input placeholder="Username" label="Username" color="primaryLightContrast" />
				</Grid>
				<Spacer y={1} />
				<Grid>
					<Input.Password placeholder="Password" label="Password" color="primaryLightContrast" />
				</Grid>
				<Spacer y={1} />
				<Grid.Container justify='flex-end'>
					<Grid >
						<Button bordered color="$white" onClick={dummyLogin} auto>
							<Text >Sign up</Text>
						</Button>
					</Grid>
					<Grid >
						<Button bordered color="$white" onClick={dummyLogin} auto>
							<Text >Dummy sign up</Text>
						</Button>
					</Grid>
				</Grid.Container>
			</Grid.Container>
		</Grid>
	)
}
