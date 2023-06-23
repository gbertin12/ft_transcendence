import { useUser } from '@/contexts/user.context';
import { Channel, PowerAction, SenderData, User } from '@/interfaces/chat.interfaces';
import { Avatar, Button, Container, Grid, Input, Loading, Modal, Spinner, Switch, Text, Tooltip } from '@nextui-org/react';
import { IconBan, IconDoorExit, IconGavel, IconHourglass, IconInfinity, IconInfinityOff, IconSpy, IconSpyOff, IconVolume3 } from '@tabler/icons-react';
import axios from 'axios';
import React, { useCallback } from 'react';

interface PowerModalProps {
    open: boolean;
    onClose: () => void;
    punished: SenderData;
    channel: Channel;
    type: PowerAction;
}

function typeToNatural(type: PowerAction): string {
    switch (type) {
        case 'banned':
            return 'Ban';
        case 'muted':
            return 'Mute';
        case 'kicked':
            return 'Kick';
        default:
            return type;
    }
}

function typeToIcon(type: PowerAction): JSX.Element {
    switch (type) {
        case 'muted':
            return (
                <Text color="error">
                    <IconVolume3 size={48} />
                </Text>
            );
        case 'banned':
            return (
                <Text color="error">
                    <IconBan size={48} />
                </Text>
            );
        case 'kicked':
            return (
                <Text color="error">
                    <IconDoorExit size={48} />
                </Text>
            );
        default:
            return <></>;
    }
}

function getDefaultUnbanDate(): string {
    let date = new Date();
    // Add 10 minutes to the current date
    date.setMinutes(date.getMinutes() + 10);
    // Format the date to be compatible with the input
    return date.toISOString().slice(0, -8);
}

const applyPunishment = async (punished: SenderData, channel: Channel, type: PowerAction, permanent: boolean, stealth: boolean, unbanDate: string): Promise<void> => {
    // Resolve the promise after 2 seconds
    const permDuration = 365 * 24 * 60 * 60 * 5; // 5 years (permanent)
    let unbanDateUTC = new Date(unbanDate).getTime();
    let duration = permanent ? permDuration : Math.abs((unbanDateUTC - new Date().getTime()) / 1000);
    switch (type) {
        case 'banned':
            await axios.put(`http://localhost:3000/channel/${channel.id}/ban/${punished.id}`,
                {
                    duration: duration
                }, {
                withCredentials: true,
                validateStatus: () => true // The front won't display buttons if the user
            })
            break;
        case 'kicked':
            await axios.put(`http://localhost:3000/channel/${channel.id}/kick/${punished.id}`,
                null,
                {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway
            break;
        case 'muted':
            axios.put(`http://localhost:3000/channel/${channel.id}/mute/${punished.id}`,
                {
                    duration: duration,
                }, {
                withCredentials: true,
                validateStatus: () => true // The front won't display buttons if the user
            })                             // is not allowed to use them anyway
            break;
        default:
            break;
    }
}

const PowerModal: React.FC<PowerModalProps> = ({ open, onClose, punished, channel, type }) => {
    const { user } = useUser();
    const [permanent, setPermanent] = React.useState<boolean>(false);
    const [stealth, setStealth] = React.useState<boolean>(false);
    const [unbanDate, setUnbanDate] = React.useState<string>(getDefaultUnbanDate());
    const [working, setWorking] = React.useState<boolean>(false);

    return (
        <Modal
            closeButton
            open={open}
            onClose={onClose}
            width='35rem'
        >
            <Modal.Header>
                <Container direction='column'>
                    <Text h2>
                        {typeToNatural(type)} {punished.name}
                    </Text>
                    <Text h5>
                        #{channel.name}
                    </Text>
                </Container>
            </Modal.Header>
            <Modal.Body>
                {/* You avatar + punishment icon + Punished avatar + duration under icon + un-punishment date under punished avatar */}
                <Grid.Container gap={1} justify="space-around" alignItems="center">
                    <Grid>
                        <Container direction='column' justify='center' alignItems='center'>
                            <Avatar
                                src={`http://localhost:3000/static/avatars/${user.avatar}`}
                                size="xl"
                                alt={user.name}
                            />
                            <Text h5 css={{ ta: "center" }}>
                                You
                            </Text>
                        </Container>
                    </Grid>
                    <Grid>
                        <Text h3>
                            {typeToIcon(type)}
                        </Text>
                    </Grid>
                    <Grid>
                        <Container direction='column' justify='center' alignItems='center'>
                            <Avatar
                                src={`http://localhost:3000/static/avatars/${punished.avatar}`}
                                size="xl"
                                alt={punished.name}
                                css={{ filter: "grayscale(80%)" }}
                            />
                            <Text h5 css={{ ta: "center" }}>
                                {punished.name}
                            </Text>
                        </Container>
                    </Grid>
                </Grid.Container>
            </Modal.Body>
            <Modal.Footer>
                {(!permanent && type !== "kicked") && (
                    <Input
                        aria-label='Set the duration of the punishment'
                        type="datetime-local"
                        labelLeft={<IconGavel />}
                        initialValue={unbanDate}
                        onChange={(e) => setUnbanDate(e.target.value)}
                        disabled={working}
                    >
                    </Input>
                )}
                {type !== "kicked" && (
                    <Tooltip
                        aria-label="Set the punishment as permanent"
                        content="Permanent"
                        color="error"
                        css={{ zIndex: 10000 }} // NextUI in a nutshell
                    >
                        <Switch
                            size="lg"
                            initialChecked={permanent}
                            onChange={() => setPermanent(!permanent)}
                            color="error"
                            iconOn={<IconInfinity />}
                            iconOff={<IconInfinityOff />}
                            disabled={working}
                        />
                    </Tooltip>
                )}
                <Tooltip
                    aria-label="Do not send a system message in the channel"
                    content="No system message"
                    color="error"
                    css={{ zIndex: 10000 }} // NextUI in a nutshell
                >
                </Tooltip>
                <Button
                    auto
                    flat
                    color="secondary"
                    disabled={working}
                    onPress={async () => {
                        setWorking(true);
                        await applyPunishment(punished, channel, type, permanent, stealth, unbanDate);
                        setWorking(false);
                        onClose();
                    }}
                >
                    {working ? (
                        <Loading
                            color="secondary"
                            size="sm"
                        />
                    ) : (
                        <>
                            {typeToNatural(type)}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PowerModal;