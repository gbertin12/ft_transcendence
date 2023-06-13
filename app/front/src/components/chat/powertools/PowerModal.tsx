import { Channel, User } from '@/interfaces/chat.interfaces';
import { Button, Container, Grid, Modal, Row, Text } from '@nextui-org/react';
import React from 'react';
import HourlyMessageChart from './charts/HourlyMessageChart';
import { IconX } from '@tabler/icons-react';

interface PowerModalProps {
    visible: boolean
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    channel: Channel
    user: User
    admins: Set<number>
    ownerId: number
}

const PowerModal: React.FC<PowerModalProps> = ({ visible, setVisible, channel, user, admins, ownerId }) => {
    return (
        <Modal
            open={visible}
            width="40%"
            onClose={() => setVisible(false)}
        >
            <Modal.Header>
                <Text h2>Administration Tools</Text>
            </Modal.Header>
            <Modal.Body>
                <Grid.Container gap={2}>
                    <Grid xs={6}>
                        <Row justify='center' align='center'>
                            <HourlyMessageChart channel_id={channel.id} hours={24} />
                        </Row>
                    </Grid>
                    <Grid xs={6}>
                        <Row justify='center' align='center'>
                            <HourlyMessageChart channel_id={channel.id} hours={12} />
                        </Row>
                    </Grid>
                    <Grid xs={6}>
                        <Row justify='center' align='center'>
                            <HourlyMessageChart channel_id={channel.id} hours={12} />
                        </Row>
                    </Grid>
                    <Grid xs={6}>
                        <Row justify='center' align='center'>
                            <HourlyMessageChart channel_id={channel.id} hours={12} />
                        </Row>
                    </Grid>
                </Grid.Container>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    auto
                    flat
                    color="error"
                    iconRight={<IconX />}
                    onPress={() => setVisible(false)}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PowerModal;