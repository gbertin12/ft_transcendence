import { Button, Container, Grid, Input, Loading, Popover, Text } from '@nextui-org/react';
import React from 'react';
import { ChannelNameInput, ChannelPrivateSwitch } from './ChannelCreateIcon';
import { Channel } from '@/interfaces/chat.interfaces';
import { IconLock, IconPencil } from '@tabler/icons-react';
import axios from 'axios';

interface ChannelEditIconProps {
    channel: Channel;
}

export const ChannelDeleteButton: React.FC<any> = ({ onClick, channel }: { onClick: () => void, channel: Channel }) => {
    const [deleting, setDeleting] = React.useState(false);

    if (deleting) {
        return (
            <Button
                auto
                color="error"
            >
                <Grid.Container gap={1} alignItems="center">
                    <Grid xs={8}>
                        Deleting
                    </Grid>
                    <Grid xs={4}>
                        <Loading size="sm" color="white" />
                    </Grid>
                </Grid.Container>
            </Button>
        );
    }

    return (
        <Button
            auto
            color="error"
            onClick={() => {
                setDeleting(true);
                axios.delete(`http://localhost:3000/channel/${channel.id}`, {
                    withCredentials: true,
                }).then((response) => {
                    onClick();
                }).catch((error) => {
                    throw Error("UNEXPECTED ERROR: " + error);
                });
            }}
        >
            Delete channel
        </Button>
    );
}

export const ChannelSaveButton: React.FC<any> = ({ error, onClick }: { error: string, onClick: () => void }) => {
    const [saving, setSaving] = React.useState(false);

    if (saving) {
        return (
            <Button
                auto
                color="success"
            >
                <Grid.Container gap={1} alignItems="center">
                    <Grid xs={8}>
                        Saving
                    </Grid>
                    <Grid xs={4}>
                        <Loading size="sm" color="white" />
                    </Grid>
                </Grid.Container>
            </Button>
        );
    }

    return (
        <Button
            auto
            color="success"
            disabled={error !== ""}
            onClick={() => {
                setSaving(true);
                onClick();
            }}
        >
            Save
        </Button>
    );
}

export const ChannelEditIcon: React.FC<ChannelEditIconProps> = ({ channel }) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isPrivate, setIsPrivate] = React.useState<boolean>(channel.private || channel.password !== null);
    const [error, setError] = React.useState<string>("");
    const [name, setName] = React.useState<string>("");
    const [password, setPassword] = React.useState<string | null>("");

    React.useEffect(() => {
        if (!isPrivate) {
            setPassword(null);
        }
    }, [isPrivate]);

    return (
        <Popover isOpen={isOpen} onOpenChange={(open: boolean) => {
            setIsOpen(open);
            if (open) {
                setName(channel.name);
                setIsPrivate(channel.private || channel.password !== null);
            }
        }}>
            <Popover.Trigger>
                <Grid xs={1} css={{ my: "auto" }}>
                    <IconPencil />
                </Grid>
            </Popover.Trigger>
            <Popover.Content>
                <Container css={{ py: "$6", px: "$16" }}>
                    <Grid.Container gap={1}>
                        <Grid xs={10}>
                            <ChannelNameInput
                                setName={setName}
                                error={error}
                                setError={setError}
                                name={name}
                            />
                        </Grid>
                        <Grid xs={2} css={{ my: "auto" }}>
                            <ChannelPrivateSwitch
                                error={error}
                                setPrivate={setIsPrivate}
                                isPrivate={isPrivate}
                            />
                        </Grid>
                    </Grid.Container>
                    {(isPrivate) && (
                        <Grid.Container>
                            <Grid>
                                <Input.Password
                                    underlined
                                    clearable
                                    aria-label="New password (optional)"
                                    placeholder={"Password (" + ((channel.password !== null) ? "unchanged" : "optional") + ")"}
                                    labelLeft=<IconLock />
                                    css={{ w: "stretch" }}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </Grid>
                        </Grid.Container>
                    )}
                    <Grid.Container css={{ mt: "$8" }}>
                        <Grid xs={(channel.password !== null ? 5 : 6)}>
                            <ChannelDeleteButton
                                // close popover
                                channel={channel}
                                onClick={() => {
                                    setIsOpen(false);
                                }}
                            />
                        </Grid>
                        <Grid xs={(channel.password !== null ? 3 : 6)}>
                            <ChannelSaveButton error={error} onClick={() => {
                                let editedChannel = channel;
                                editedChannel.name = name;
                                editedChannel.private = isPrivate;
                                editedChannel.password = password;
                                axios.patch(`http://localhost:3000/channel/${channel.id}`, editedChannel, {
                                    withCredentials: true,
                                }).then((response) => {
                                    setIsOpen(false);
                                }).catch((error) => {
                                    throw Error("UNEXPECTED ERROR: " + error);
                                });
                            }}
                            />
                        </Grid>
                        {/* prompt to remove password */}
                        {channel.password !== null && (
                            <Grid xs={3}>
                                <Button
                                    auto
                                    color="warning"
                                    onClick={() => {
                                        let editedChannel = channel;
                                        editedChannel.password = null;
                                        axios.patch(`http://localhost:3000/channel/${channel.id}`, editedChannel, {
                                            withCredentials: true,
                                        }).then((response) => {
                                            setIsOpen(false);
                                        }).catch((error) => {
                                            throw Error("UNEXPECTED ERROR: " + error);
                                        });
                                    }}
                                >
                                    Remove password
                                </Button>
                            </Grid>
                        )}
                    </Grid.Container>
                </Container>
            </Popover.Content>
        </Popover>
    )
}
