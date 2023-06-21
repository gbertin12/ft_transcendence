import SignIn from './SignIn';
import SignUp from './SignUp';
import React, { useState } from "react";
import { Modal, Button, Text, Grid } from "@nextui-org/react";

export default function ModalSign() {
    const [visible, setVisible] = useState(false);

    function closeModal() {
        setVisible(false);
    }

    return (
        <div>
            <Button auto onPress={() => setVisible(true)}>
                <Text color="secondary">Login</Text>
            </Button>
            <Modal closeButton
                blur
                aria-labelledby="SignIn"
                width="50%"
                open={visible}
                onClose={closeModal}>
                <Modal.Body>
                    <Grid direction="row" >
                        <Grid.Container justify='center' gap={4}>
                            <Grid>
                                <SignIn closeModal={closeModal}/>
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
