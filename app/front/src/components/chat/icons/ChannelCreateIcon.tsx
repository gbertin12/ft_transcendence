import { Channel } from '@/interfaces/chat.interfaces';
import { Button, Container, Grid, Input, Loading, Popover, Switch } from '@nextui-org/react';
import React from 'react';
import { FaLock, FaLockOpen, FaPlus } from 'react-icons/fa';

function respectCriteria(name: string): string {
    if (name.length === 0) return "Name cannot be empty";
    if (name.length <= 1) return "Name too short";
    if (name.length >= 20) return "Name too long";
    return "";
}

function transformName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase().replace(/#/g, '');
}

interface ChannelCreateProps {
    onCreation: (channel: Channel) => void;
}

export const ChannelNameInput: React.FC<any> = ({ setName, error, setError, name }: {setName: (name: string) => void, error: string, setError: (error: string) => void, name?: string}) => {
    setError(respectCriteria(name || ""));
    return (
        <Input
            autoFocus
            underlined
            clearable
            value={name || ""}
            placeholder="channel-name"
            labelLeft="#"
            helperText={error}
            helperColor={(error === "" ? "success" : "error")}
            color={(error === "" ? "success" : "error")}
            onChange={(e) => {
                setError(respectCriteria(e.target.value));
                e.target.value = transformName(e.target.value);
                setName(e.target.value);
            }}
        />
    );
}

export const ChannelPrivateSwitch: React.FC<any> = ({ error, isPrivate, setPrivate }: {error: string, isPrivate: boolean, setPrivate: (isPrivate: boolean) => void }) => {
    return (
        <Switch
            color={(error === "" ? "success" : "error")}
            iconOn={<FaLock />}
            iconOff={<FaLockOpen />}
            checked={isPrivate}
            onChange={(e) => {
                setPrivate(e.target.checked);
            }}
        />
    );
}


const ChannelCreateIcon: React.FC<ChannelCreateProps> = ({ onCreation }) => {
    const [creating, setCreating] = React.useState<boolean>(false);
    const [isPrivate, setPrivate] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>("");
    const [popIsOpen, setPopIsOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [name, setName] = React.useState<string>("");

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
                            <ChannelNameInput
                                name={name}
                                setName={setName}
                                error={error}
                                setError={setError}
                            />
                        </Grid>
                        <Grid xs={2} css={{ my: "auto" }}>
                            <ChannelPrivateSwitch
                                error={error}
                                isPrivate={isPrivate}
                                setPrivate={setPrivate}
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
                            disabled={error !== ""}
                            css={{ w: "stretch", mt: "$8" }}
                            onClick={() => {
                                setCreating(true);
                                // Send a POST to /channel/create
                                fetch("http://localhost:3000/channel/create", {
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
                                    // TODO: Handle errors
                                    .then((res) => res.json())
                                    .then((data) => {
                                        setCreating(false);
                                        onCreation(data);
                                        setPopIsOpen(false);
                                    });
                            }}
                        >
                            {error === "" ? "Create" : "Invalid name"}
                        </Button>
                    ) : (
                        <Loading size="md" css={{ w: "stretch", mt: "$8" }} />
                    )}
                </Container>
            </Popover.Content>
        </Popover>
    );
};

export default ChannelCreateIcon;