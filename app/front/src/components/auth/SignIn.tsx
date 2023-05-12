import { IconBrandDiscordFilled } from '@tabler/icons-react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { Input, Spacer, Button , Grid, Text} from "@nextui-org/react";

export default function SignIn() {
  return (
		<Grid>
		<Text h4>Sign in</Text>
		<Grid.Container justify='center' gap={1}>
	      <Grid>
		  <Button
	        auto bordered
	        color="$white"
	        icon={<IconBrandDiscordFilled fill="$white" />}
	      />
	      </Grid>
	      <Grid>
	        <Button bordered color="$white" auto>
	          <Text >42</Text>
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
		  <Grid.Container direction="column" >
		  <Grid>

		   <Input placeholder="Email" label="Email"/>
		   </Grid>
		    <Spacer y={1} />
	   <Grid>
	   <Input placeholder="Password" label="Password"/>
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
	   </Grid>
  )
}
