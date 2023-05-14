import { Input, Spacer, Button , Grid, Text} from "@nextui-org/react";

export default function SignIn() {
  return (
		  <Grid>
		  <Text h4 color="primaryLightContrast">Sign up</Text>
			<Grid.Container direction="column">
			<Grid>

			 <Input placeholder="Username" label="Username" color="primaryLightContrast"/>
			 </Grid>
			  <Spacer y={1} />
		 <Grid>
		 <Input.Password placeholder="Password" label="Password" color="primaryLightContrast"/>
		 </Grid>
		 <Spacer y={1}/>
		 <Grid.Container justify='flex-end'>
  	   <Grid >
  	   <Button bordered color="$white" auto>
  		 <Text >Sign up</Text>
  	   </Button>
  	   </Grid>
  	   </Grid.Container>
  	   </Grid.Container>
  	   </Grid>
  )
}
