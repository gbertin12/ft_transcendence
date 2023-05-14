// import React from "react";
// import { Modal, Button, Text, Input, Spacer, Grid} from "@nextui-org/react";
import SignIn from './SignIn';
import SignUp from './SignUp';
//
// export default function ModalSign() {
// 	  const [visible, setVisible] = React.useState(false);
// const handler = () => setVisible(true);
//
// const closeHandler = () => {
//   setVisible(false);
//   console.log("closed");
// };
// return (
// 	<Button auto shadow onPress={handler}>
//          Se connecter
//         </Button>
//         <Modal closeButton
// 		  blur
//           aria-labelledby="SignIn"
//           open={visible}
//           onClose={closeHandler}
//         >
//           <Modal.Body>
// 		  <Grid direction="row" >
// 		  <Grid.Container justify='center' gap={4} >
// 		  <Grid>
// 		  	<SignIn/>
// 		  	</Grid>
// 		  	<Grid>
// 		  	<SignUp/>
// 		  	</Grid>
// 		  	</Grid.Container>
// 		  </Grid>
//           </Modal.Body>
//         </Modal>
// );
// }

import React from "react";
import { Modal, Button, Text, Input, Row, Checkbox, Grid } from "@nextui-org/react";
// import { Mail } from "./Mail";
// import { Password } from "./Password";

export default function App() {
  const [visible, setVisible] = React.useState(false);
  const handler = () => setVisible(true);

  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  return (
    <div>
	  <Button auto   onPress={handler}>
           Se connecter
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
  		  	<SignIn/>
  		  	</Grid>
  		  	<Grid>
  		  	<SignUp/>
  		  	</Grid>
  		  	</Grid.Container>
  		  </Grid>
            </Modal.Body>
          </Modal>
    </div>
  );
}
