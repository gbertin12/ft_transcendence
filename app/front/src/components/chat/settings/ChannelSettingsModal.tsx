import { Channel } from '@/interfaces/chat.interfaces';
import { Button, Container, Modal, Spacer, Text } from '@nextui-org/react';
import React from 'react';
import MembersTab from './tabs/members';
import PunishmentsTab from './tabs/punishments';

interface ChannelSettingsProps {
    channel: Channel;
    open: boolean;
    onClose: () => void;
}

function renderTab(tab: string, channel: Channel) {
    switch (tab) {
        case "members":
            return (
                <MembersTab channel={channel} />
            );
        case "punishments":
            return (
                <PunishmentsTab channel={channel} />
            );
        default:
            return (
                <MembersTab channel={channel} />
            );
    }
}

const ChannelSettings: React.FC<ChannelSettingsProps> = ({ channel, open, onClose }) => {
    const [tab, setTab] = React.useState<string>("members");
    // members = List of members, with the ability to promote / demote / kick / ban / mute
    // punishments = List of punishments, with the ability to revoke them
    return (
        <Modal
            closeButton
            aria-labelledby="modal-title"
            onClose={onClose}
            open={open}
            width='80rem'
        >
            <Modal.Header>
                <Text h4>
                    #{channel.name} settings
                </Text>
            </Modal.Header>
            <Modal.Body>
                {/* Chips to select the tab */}
                <Container fluid display='flex' justify='center'>
                    <Button.Group color="secondary" flat>
                        <Button
                            disabled={tab === "members"}
                            onPress={() => setTab("members")}
                        >
                            Members
                        </Button>
                        <Button
                            disabled={tab === "punishments"}
                            onPress={() => setTab("punishments")}
                        >
                            Punishments
                        </Button>
                    </Button.Group>
                </Container>
                <Spacer y={0.5} />
                {/* Tab content */}
                <Container fluid>
                    {renderTab(tab, channel)}
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button auto flat color="error" onPress={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChannelSettings;