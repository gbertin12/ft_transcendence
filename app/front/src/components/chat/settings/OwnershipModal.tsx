import { useUser } from '@/contexts/user.context';
import { Channel, User } from '@/interfaces/chat.interfaces';
import { Avatar, Button, Container, Grid, Input, Loading, Modal, Text } from '@nextui-org/react';
import { Icon2fa, IconArrowsTransferUp, IconAsterisk, IconExclamationMark, IconPassword, IconShieldBolt } from '@tabler/icons-react';
import axios from 'axios';
import React from 'react';

interface OwnershipModalProps {
    open: boolean;
    onClose: () => void;
    channel: Channel;
    futureOwner: User;
}

function transferOwnership(channel: Channel, futureOwner: User, password: string, otp: string): Promise<boolean> {
    let formData: Record<string, any> = {
        new_owner: futureOwner.id,
    };
    if (password) {
        formData['password'] = password;
    }
    if (otp) {
        formData['otp'] = otp;
    }
    return axios.patch(`http://localhost:3000/channel/${channel.id}/transfer`, formData, {
        withCredentials: true,
    }).then((response) => {
        return true;
    }
    ).catch((error) => {
        return false;
    });
}

const OwnershipModal: React.FC<OwnershipModalProps> = ({ open, onClose, channel, futureOwner }) => {
    const { user } = useUser();
    const [countdown, setCountdown] = React.useState<number>(3);
    const [password, setPassword] = React.useState<string>('');
    const [otp, setOtp] = React.useState<string>('');
    const [authFieldError, setAuthFieldError] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            setCountdown(3);
            const interval = setInterval(() => {
                setCountdown((countdown) => countdown - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [open]);

    return (
        <Modal
            blur
            closeButton
            open={open}
            onClose={onClose}
            width='42rem'
        >
            <Modal.Header>
                <Text h2 color="error">
                    Transfer ownership
                </Text>
            </Modal.Header>
            <Modal.Body>
                <Grid.Container gap={1} justify="space-around" alignItems="center">
                    <Grid>
                        <Container direction='column' justify='center' alignItems='center'>
                            <Avatar
                                src={`http://localhost:3000/static/avatars/${user.avatar}`}
                                size="xl"
                                alt={user.name}
                                css={{ filter: "grayscale(80%)" }}
                            />
                            <Text h5 css={{ ta: "center" }} color="error">
                                You
                            </Text>
                        </Container>
                    </Grid>
                    <Grid>
                        <Text h3 color="error" css={{ transform: "rotate(90deg)" }}>
                            <IconArrowsTransferUp />
                        </Text>
                    </Grid>
                    <Grid>
                        <Container direction='column' justify='center' alignItems='center'>
                            <Avatar
                                src={`http://localhost:3000/static/avatars/${futureOwner.avatar}`}
                                size="xl"
                                alt={futureOwner.name}
                            />
                            <Text h5 css={{ ta: "center" }} color="error">
                                {futureOwner.name}
                            </Text>
                        </Container>
                    </Grid>
                </Grid.Container>
            </Modal.Body>
            <Modal.Footer css={{"pb": "$16"}}>
                <Grid.Container>
                    <Grid xs={8}>
                        <Container display='flex' justify='flex-start'>
                            {user.otp && (
                                <Input
                                    fullWidth
                                    aria-label='Enter your MFA token'
                                    labelLeft={<Icon2fa />}
                                    placeholder='MFA token'
                                    helperColor='error'
                                    type='number'
                                    helperText={authFieldError}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            )}
                            {(user.password !== null && !user.otp) && (
                                <Input
                                    fullWidth
                                    aria-label='Enter your password'
                                    labelLeft={<IconPassword />}
                                    placeholder='Password'
                                    helperColor='error'
                                    type='password'
                                    helperText={authFieldError}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}
                            {(user.password === null && !user.otp) && (
                                <Text h4 color="warning" css={{ display: "flex" }}>
                                    Consider enabling 2FA to secure your account.
                                </Text>
                            )}
                        </Container>
                    </Grid>
                    <Grid xs={4}>
                        <Container display='flex' justify='flex-end'>
                            <Button shadow color="error" disabled={countdown > 0 || loading} onPress={() => {
                                setLoading(true);
                                transferOwnership(channel, futureOwner, password, otp).then((success) => {
                                    if (success) {
                                        onClose();
                                        setLoading(false);
                                    } else {
                                        setAuthFieldError('Invalid credentials.')
                                        setLoading(false);
                                    }
                                });
                            }}>
                                {loading && (
                                    <Loading color="error" />
                                ) || (
                                    <>
                                        Transfer {countdown > 0 && `(${countdown})`}
                                    </>
                                )}
                            </Button>
                        </Container>
                    </Grid>
                </Grid.Container>
            </Modal.Footer>
        </Modal>
    );
};

export default OwnershipModal;