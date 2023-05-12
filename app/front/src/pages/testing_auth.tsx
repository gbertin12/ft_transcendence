import Head from 'next/head';
import {Grid, Spacer} from "@nextui-org/react";

import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';
export default function Game() {
	return (
	<>
		<Head>
			<title> Sign in </title>
		</Head>
		<Spacer y={4} />
		<Grid direction="row" >
		<Grid.Container justify='center' gap={4} >
		<Grid>
			<SignIn/>
			</Grid>
			<Grid>
			<SignUp/>
			</Grid>

			</Grid.Container>

		</Grid>
	</>
	);
}
