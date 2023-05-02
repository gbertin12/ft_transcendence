import { Channel } from '@/interfaces/chat.interfaces';
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

interface ChannelCreateProps {
    onCreation: (channel: Channel) => void;
}

const ChannelCreatePopover: React.FC<ChannelCreateProps> = ({ onCreation }) => {
    const [error, setError] = React.useState<string>("");
    const [creating, setCreating] = React.useState<boolean>(false);
    const [isPrivate, setPrivate] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [popIsOpen, setPopIsOpen] = React.useState<boolean>(false);

    return (
        <Popover isOpen={popIsOpen} onOpenChange={(open: boolean) => {
            setPopIsOpen(open);
            if (open) {
                setName("");
                setPassword("");
                setPrivate(false);
                setError("");
            }
        }}>
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
                                autoFocus
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
                                    setName(e.target.value);
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
                                    labelLeft=<FaLock />
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
                                // Send a POST to /channel/create
                                fetch("http://localhost:3001/channel/create", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        name: name,
                                        isPrivate: isPrivate,
                                        password: password,
                                    })
                                })
                                    .then((res) => res.json())
                                    .then((data) => {
                                        setCreating(false);
                                        onCreation(data);
                                        setPopIsOpen(false);
                                    });
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