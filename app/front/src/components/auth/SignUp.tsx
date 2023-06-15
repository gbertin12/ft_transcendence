import { Input, Spacer, Button, Grid, Text , FormElement} from "@nextui-org/react";
import React, {FormEvent,  useState } from 'react';


function dummyLogin() {
	window.location.href = 'http://localhost:3000/auth/dummy';
}

export default function SignUp() {

    const [ Username, setUsername ] = useState<string>("");
    const [ Password, setPassword ] = useState<string>("");

	function handleUsername(event: FormEvent<FormElement>) {
		const target = event.target as HTMLInputElement;
        setUsername(target.value);
    }

	function handlePassword(event: FormEvent<FormElement>) {
		const target = event.target as HTMLInputElement;
		setPassword(target.value);
	}

	function ConnectAccount() 
	{
		console.log(Username);
		console.log(Password);
		console.log("jijijijjijji");
	// ft_transcendence/app/back/src/auth/auth.controller.ts (login) set "" si fail
	}
	
	return (
		<Grid>
			<Text h4 color="primaryLightContrast">Sign up</Text>
			<Grid.Container direction="column">
				<Grid>
					<Input placeholder="Username" label="Username" value={Username} onInput={handleUsername} />
				</Grid>
				<Spacer y={1} />
				<Grid>
					<Input.Password placeholder="Password" label="Password" value={Password} onInput={handlePassword} />
				</Grid>
				<Spacer y={1} />
				<Grid.Container justify='flex-end'>
					<Grid >
						<Button bordered color="$white" onClick={ConnectAccount} auto>
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
