import { useUser } from "@/contexts/user.context";
import { Input, Spacer, Button, Grid, Text, Row, FormElement } from "@nextui-org/react";
import axios from 'axios';
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

export default function SignUp() {
    const [ username, setUsername ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");
    const [ msg, setMsg ] = useState<string>("");
    const [ color, setColor ] = useState<string>("");

    const [ nextPage, setNextPage ] = useState<string>("/profile");
    const router = useRouter();
    const { setUser } = useUser();

    useEffect(() => {
        if (router.isReady) {
            if (router.query && router.query.next) {
                setNextPage(router.query.next);
            }
        }
    }, [router]);

    async function refreshUser() {
        const res = await fetch("http://localhost:3000/user/me", { credentials: "include" });
        if (res?.ok) {
            const userData = await res.json();
            setUser(userData);
        }
    }

    async function dummyLogin() {
        await fetch("http://localhost:3000/auth/dummy", { credentials: "include" });
        //await refreshUser();
        //router.push(nextPage);
        window.location.href = nextPage;
    }

    function register() {
        if (username && password) {
            axios.post("http://localhost:3000/auth/register", { username, password })
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
    }

    return (
        <Grid>
            <Text h4 color="primaryLightContrast">Register</Text>
            <Grid.Container direction="column">
                <Row>

                    <Input bordered onInput={handleOnInputUsername} value={username} placeholder="Username" label="Username"/>
                </Row>

                <Spacer y={1} />

                <Row>
                    <Input.Password bordered onInput={handleOnInputPassword} value={password} placeholder="Password" label="Password"/>
                </Row>

                {(msg) && (<>
                    <Spacer y={1}/>
                    <Row>
                        <Text color={color}>{msg}</Text>
                    </Row>
                </>)}

                <Spacer y={1}/>

                <Grid.Container justify='flex-end'>
                    <Grid >
                        <Button bordered color="primarySolidContrast" onPress={register} auto>
                            <Text>Register</Text>
                        </Button>
                    </Grid>

                    <Spacer x={1}/>

                    <Grid >
                        <Button bordered color="primarySolidContrast" onPress={dummyLogin} auto>
                            <Text >Dummy login</Text>
                        </Button>
                    </Grid>
                </Grid.Container>
            </Grid.Container>
        </Grid>
    )
}
