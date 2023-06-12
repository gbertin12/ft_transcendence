import { IconBrandDiscordFilled } from '@tabler/icons-react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { Input, Spacer, Button , Grid, Text, Image} from "@nextui-org/react";

async function login() {
    const res = await fetch('http://bess-f1r2s5:3000/auth/42/state', { credentials: 'include' });
    const state_token = await res.text();
    //document.cookie = `state=${state_token};SameSite=None`;
    //const payload = jwtDecode<JwtPayload>(state_token);
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a&redirect_uri=http%3A%2F%2Fbess-f1r2s5%3A3000%2Fauth%2F42%2Fcallback&response_type=code&state=${state_token}`;
}

export default function SignIn() {
  return (
		<Grid>
		<Text h4>Sign in</Text>

		  <Grid.Container direction="column" >
		  <Grid>

		   <Input placeholder="Username" label="Username"/>
		   </Grid>
		    <Spacer y={1} />
	   <Grid>
	   <Input.Password placeholder="Password" label="Password"/>
	   </Grid>
	   <Spacer y={1}/>
	   <Grid.Container justify='flex-end'>
	   <Grid >
	   <Button bordered color="$white" auto>
		 <Text >Sign in</Text>
	   </Button>
	   </Grid>
	   </Grid.Container>
	   </Grid.Container>
	   <Spacer x={0.5}/>
	   <hr/>
	   <Spacer x={0.5}/>
	   <Grid.Container justify='center' gap={1}>
		 <Grid>
		 <Button
		   auto bordered
		   color="$white"
		   icon={<IconBrandDiscordFilled fill="$white" />}
		 />
		 </Grid>
		 <Grid>
		   <Button bordered onClick={login} color="$white" auto
			  icon="42">
		   </Button>
		 </Grid>
		 <Grid>
		 <Button
		   auto bordered
		   color="$white"
		   icon={<IconBrandGithubFilled/>}
		 />
		 </Grid>
		 </Grid.Container>
	   </Grid>
  )
}
