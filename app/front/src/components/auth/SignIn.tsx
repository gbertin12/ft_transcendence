import { IconBrandDiscordFilled } from '@tabler/icons-react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { Input, Spacer, Button , Grid, Text, Row, FormElement } from "@nextui-org/react";
import { useRouter } from 'next/router';
import axios from 'axios';
import { FormEvent, useState } from 'react';

export default function SignIn({ closeModal }: { closeModal: () => void }) {
    const [ username, setUsername ] = useState<string>("");
    const [ password, setPassword] = useState<string>("");
    const [ error, setError ] = useState<string>("");
    const router = useRouter();

    async function userPassLogin() {
        if (username && password) {
            axios.post("http://localhost:3000/auth/login", { username, password }, {  withCredentials: true })
                .then((res) => {
                    closeModal();
                    router.push(res.data);
                })
                .catch((_err) => {
                    setError("login failed");
                })
        }
    }

    async function ftLogin() {
        const res = await fetch('http://localhost:3000/auth/42/state', { credentials: 'include' });
        const state_token = await res.text();
        router.push(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42%2Fcallback&response_type=code&state=${state_token}`);
    }

    function discordLogin() {
        router.push('http://localhost:3000/auth/discord/callback');
    }

    function githubLogin() {
        router.push('http://localhost:3000/auth/github/callback');
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
            <Text h4>Sign in</Text>
            <Grid.Container direction="column" >
                <Row>
                    <Input bordered onInput={handleOnInputUsername} value={username} placeholder="Username" label="Username"/>
                </Row>

                <Spacer y={1} />

                <Row>
                    <Input.Password bordered onInput={handleOnInputPassword} value={password} placeholder="Password" label="Password"/>
                </Row>

                <Spacer y={1}/>

                {(error) && (<>
                    <Spacer y={1}/>
                    <Text color="error">{error}</Text>
                </>)}

                <Grid.Container justify='flex-end'>
                    <Grid >
                        <Button bordered onPress={userPassLogin} auto color="primarySolidContrast">
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
                    <Button bordered color="primarySolidContrast" onPress={ftLogin} auto icon="42">
                    </Button>
                </Grid>

                <Grid>
                    <Button
                        auto bordered
                        color="primarySolidContrast"
                        onPress={discordLogin}
                        icon={<IconBrandDiscordFilled fill="$white" />}
                    />
                </Grid>

                <Grid>
                    <Button
                        auto bordered
                        color="primarySolidContrast"
                        onPress={githubLogin}
                        icon={<IconBrandGithubFilled/>}
                    />
                </Grid>
            </Grid.Container>
        </Grid>
    )
}
