//import { useUser } from "@/contexts/user.context";
import { Input, Spacer, Button, Grid, Text, Row, FormElement, Tooltip } from "@nextui-org/react";
//import axios from 'axios';
//import { FormEvent, useState } from "react";

export default function SignUp() {
    /*const [ msg, setMsg ] = useState<string>("");
    const [ color, setColor ] = useState<string>("");*/

    //const { setUser } = useUser();

    /*async function refreshUser() {
        const res = await fetch("http://paul-f4br5s1:3000/user/me", { credentials: "include" });
        if (res?.ok) {
            const userData = await res.json();
            setUser(userData);
        }
    }&*/

    async function dummyLogin() {
        await fetch("http://paul-f4br5s1:3000/auth/dummy", { credentials: "include" });
        //await refreshUser();
        //router.push(nextPage);
        window.location.href = "/profile";
    }

    /*function register() {
        if (username && password) {
            axios.post("http://paul-f4br5s1:3000/auth/register", { username, password })
                .then((_res) => {
                    setColor("success");
                    setMsg("Registered successfully");
                })
                .catch((err) => {
                    setColor("error");
                    setMsg(err.response.data.message);
                })
                .finally(() => {
                    setUsername("");
                    setPassword("");
                });
        }
    }

    function handleOnInputUsername(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setUsername(target.value);
    }

    function handleOnInputPassword(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setPassword(target.value);
    }*/

    return (
        <Grid>
            <Text h4 color="primaryLightContrast">Register</Text>
            <Grid.Container direction="column">
                <Row>

                    <Input bordered placeholder="Username" label="Username"/>
                </Row>

                <Spacer y={1} />

                <Row>
                    <Input.Password bordered placeholder="Password" label="Password"/>
                </Row>

                {/*
                {(msg) && (<>
                    <Spacer y={1}/>
                    <Row>
                        <Text color={color}>{msg}</Text>
                    </Row>
                </>)}
                */}

                <Spacer y={1}/>

                <Grid.Container justify='flex-end'>
                    <Grid >
                        <Tooltip content={"Coming Soon!!"} color="invert" css={{ zIndex: 1000001 }}>
                            <Button bordered disabled auto>
                                <Text>Register</Text>
                            </Button>
                        </Tooltip>
                    </Grid>

                    <Spacer x={1}/>

                    <Grid >
                        <Button bordered onPress={dummyLogin} auto>
                            <Text >Dummy login</Text>
                        </Button>
                    </Grid>
                </Grid.Container>
            </Grid.Container>
        </Grid>
    )
}
