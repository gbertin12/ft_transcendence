import { IconBrandDiscordFilled } from '@tabler/icons-react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { Input, Spacer, Button , Grid, Text, Row, Modal, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import MFAInput from './MFAInput';
//import { useUser } from '@/contexts/user.context';
import { useRouter } from 'next/router';

export default function SignIn({ closeModal }: { closeModal: () => void }) {
    const [ showInput, setShowInput ] = useState<boolean>(false);
    const [ otp, setOtp ] = useState<string>("");
    const [ mfaError, setMfaError ] = useState<string>("");

    //const { setUser } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            if (router.query.otp) {
                const otp = (router.query.otp === "true");
                if (otp) {
                    setShowInput(true);
                } else {
                    window.location.href = "/profile";
                }
            }
        }
    }, [router]);

    async function verify2FA() {
        const res = await fetch("http://paul-f4br5s1:3000/auth/2fa/verify", {
            credentials: "include",
            method: "POST",
            body: JSON.stringify({ otp }),
            headers: { "Content-Type": "application/json" },
        });
        if (res?.ok) {
            setShowInput(false);
            closeModal();
            //await refreshUser();
            //router.push(nextPage);
            window.location.href = "/profile";
        } else {
            setMfaError("Invalid code");
            setOtp("");
        }
    }

    async function ftLogin() {
        const res = await fetch('http://paul-f4br5s1:3000/auth/42/state', { credentials: 'include' });
        const state_token = await res.text();
        router.push(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a&redirect_uri=http%3A%2F%2Fpaul-f4br5s1%3A3000%2Fauth%2F42%2Fcallback&response_type=code&state=${state_token}`);
    }

    /*async function refreshUser() {
        const res = await fetch("http://paul-f4br5s1:3000/user/me", { credentials: "include" });
        if (res?.ok) {
            const userData = await res.json();
            setUser(userData);
        }
    }

    async function userPassLogin() {
        if (username && password) {
            const res = await fetch("http://paul-f4br5s1:3000/auth/login", {
                credentials: "include",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (res?.ok) {
                const data = await res.json();
                if (data.otp) {
                    setShowInput(true);
                } else {
                    //await refreshUser();
                    //router.push(nextPage);
                    window.location.href = "/profile";
                }
            } else {
                setError("Login failed");
            }
        }
    }*/

    /*function discordLogin() {
        router.push('http://paul-f4br5s1:3000/auth/discord/callback');
    }

    function githubLogin() {
        router.push('http://paul-f4br5s1:3000/auth/github/callback');
    }

    function handleOnInputUsername(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setUsername(target.value);
    }

    function handleOnInputPassword(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setPassword(target.value);
    }*/

    if (showInput) {
        return (
            <Modal
                closeButton
                preventClose
                width="25%"
                aria-labelledby="2FA Input"
                open={showInput}
                onClose={() => setShowInput(false)}>
                <Modal.Header>
                    <Text>Enter your TOTP to continue</Text>
                </Modal.Header>

                <Modal.Body>
                    <MFAInput code={otp} setCode={setOtp} btnCallback={verify2FA}/>
                    {(mfaError) && (<Text color="error">{mfaError}</Text>)}
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Grid>
            <Text h4>Login</Text>
            <Grid.Container direction="column" >
                <Row>
                    <Input bordered placeholder="Username" label="Username"/>
                </Row>

                <Spacer y={1} />

                <Row>
                    <Input.Password bordered placeholder="Password" label="Password"/>
                </Row>

                <Spacer y={1}/>

                <Grid.Container justify='flex-end'>
                    <Grid >
                        <Tooltip content={"Coming Soon!!"} color="invert" css={{ zIndex: 1000001 }}>
                            <Button bordered disabled auto>
                                <Text>Login</Text>
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid.Container>
            </Grid.Container>

            <Spacer x={0.5}/>
            <hr/>
            <Spacer x={0.5}/>

            <Grid.Container justify='center' gap={1}>
                <Grid>
                    <Button bordered onPress={ftLogin} auto icon="42">
                    </Button>
                </Grid>

                <Grid>
                    <Tooltip content={"Coming Soon!!"} color="invert" css={{ zIndex: 1000001 }}>
                        <Button
                            auto bordered disabled
                            icon={<IconBrandDiscordFilled />}
                        />
                    </Tooltip>
                </Grid>

                <Grid>
                    <Tooltip content={"Coming Soon!!"} color="invert" css={{ zIndex: 1000001 }}>
                        <Button
                            auto bordered disabled
                            icon={<IconBrandGithubFilled/>}
                        />
                    </Tooltip>
                </Grid>
            </Grid.Container>
        </Grid>
    )
}
