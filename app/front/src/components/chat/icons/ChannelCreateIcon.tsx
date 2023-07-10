import { Button, Container, Grid, Input, Loading, Popover, Switch, Tooltip } from '@nextui-org/react';
import { IconEye, IconEyeClosed, IconLock, IconLockOpen, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import React from 'react';

function respectCriteria(name: string): string {
    if (name.length === 0) return "Name cannot be empty";
    if (name.length <= 1) return "Name too short";
    if (name.length >= 20) return "Name too long";
    return "";
}

function transformName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase().replace(/#/g, '');
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
            aria-label="Name of the channel"
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
            iconOn={<IconEyeClosed />}
            iconOff={<IconEye />}
            checked={isPrivate}
            onChange={(e) => {
                setPrivate(e.target.checked);
            }}
        />
    );
}


const ChannelCreateIcon: React.FC = () => {
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
                    <IconPlus />
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
                                    labelLeft=<IconLock />
                                    aria-label="Password of the channel"
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
                                axios.post("http://paul-f4br5s1:3000/channel/create", {
                                    name: name,
                                    private: isPrivate,
                                    password: password,
                                }, {
                                    withCredentials: true,
                                })
                                .then((res) => {
                                    setCreating(false);
                                    setPopIsOpen(false);
                                }).catch((err) => {
                                    setCreating(false);
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