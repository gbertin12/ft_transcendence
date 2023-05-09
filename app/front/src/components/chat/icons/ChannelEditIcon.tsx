import { Button, Container, Grid, Input, Loading, Popover, Text } from '@nextui-org/react';
import React from 'react';
import { FaLock, FaPen } from 'react-icons/fa';
import { ChannelNameInput, ChannelPrivateSwitch } from './ChannelCreateIcon';
import { Channel } from '@/interfaces/chat.interfaces';
// import ChannelDeleteIcon from './ChannelDeleteIcon';

interface ChannelEditIconProps {
    channel: Channel;
    onDelete: (channel: Channel) => void; // confirm channel deletion (button onClick)
    onEdit: (channel: Channel) => void; // channel edited (in any way)
}

const ChannelDeleteButton: React.FC<any> = ({ onClick }: { onClick: () => void }) => {
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
                onClick();
            }}
        >
            Delete channel
        </Button>
    );
}

const ChannelSaveButton: React.FC<any> = ({ error, onClick }: { error: string, onClick: () => void }) => {
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

    const ChannelEditIcon: React.FC<ChannelEditIconProps> = ({ channel, onDelete, onEdit }) => {
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
                        <FaPen />
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
                                        placeholder={"Password (" + ((channel.password !== null) ? "unchanged" : "optional") + ")"}
                                        labelLeft=<FaLock />
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
                                    onClick={() => {
                                        setIsOpen(false);
                                        onDelete(channel);
                                    }}
                                />
                            </Grid>
                            <Grid xs={(channel.password !== null ? 3 : 6)}>
                                <ChannelSaveButton error={error} onClick={() => {
                                    let editedChannel = channel;
                                    editedChannel.name = name;
                                    editedChannel.private = isPrivate;
                                    editedChannel.password = password;
                                    setIsOpen(false);
                                    onEdit(editedChannel);
                                }} />
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
                                            setIsOpen(false);
                                            onEdit(editedChannel);
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

export default ChannelEditIcon;