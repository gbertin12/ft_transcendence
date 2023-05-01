import { Button, Container, Grid, Input, Loading, Popover, Switch } from '@nextui-org/react';
import React from 'react';
import { FaLock, FaLockOpen, FaPlus } from 'react-icons/fa';

const validMessage: string = "That's a good name";

function respectCriteria(name: string): string {
    if (name.length <= 1) return "Name too short";
    if (name.length >= 20) return "Name too long";
    return validMessage;
}

function transformName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
}

const ChannelCreatePopover: React.FC<any> = ({ }) => {
    const [error, setError] = React.useState<string>("");
    const [creating, setCreating] = React.useState<boolean>(false);
    const [isPrivate, setPrivate] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>("");

    return (
        <Popover>
            <Popover.Trigger>
                <Grid xs={2} justify="flex-end" css={{ my: "auto" }} as="a">
                    <FaPlus />
                </Grid>
            </Popover.Trigger>
            <Popover.Content>
                <Container css={{ py: "$6", px: "$16" }}>
                    <Grid.Container gap={1}>
                        <Grid xs={10}>
                            <Input
                                underlined
                                clearable
                                placeholder="channel-name"
                                labelLeft="#"
                                helperText={error}
                                helperColor={(error === validMessage ? "success" : "error")}
                                color={(error === validMessage ? "success" : "error")}
                                onChange={(e) => {
                                    setError(respectCriteria(e.target.value));
                                    e.target.value = transformName(e.target.value);
                                }}
                            />
                        </Grid>
                        <Grid xs={2} css={{my: "auto"}}>
                            <Switch
                                color={(error === validMessage ? "success" : "error")}
                                iconOn={<FaLock />}
                                iconOff={<FaLockOpen />}
                                onChange={() => setPrivate(!isPrivate)}
                            />
                        </Grid>
                    </Grid.Container>
                    {(isPrivate) ? (
                        <Grid.Container gap={1}>
                            <Grid xs={12}>
                                <Input.Password
                                    underlined
                                    clearable
                                    placeholder="Password (optional)"
                                    labelLeft="🔒"
                                    css={{ w: "stretch" }}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </Grid>
                        </Grid.Container>
                    ) : (<></>)}
                    {(!creating) ? (
                        <Button
                            disabled={error !== validMessage}
                            css={{ w: "stretch", mt: "$8" }}
                            onClick={() => {
                                setCreating(true);
                                // todo: API post
                            }}
                        >
                            {error === validMessage ? "Create" : "Invalid name"}
                        </Button>
                    ) : (
                        <Loading size="md" css={{ w: "stretch", mt: "$8" }} />
                    )}
                </Container>
            </Popover.Content>
        </Popover>
    );
};

export default ChannelCreatePopover;