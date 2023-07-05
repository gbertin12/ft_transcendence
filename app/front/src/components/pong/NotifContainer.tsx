import { useNotif } from '@/contexts/notif.context';
import { useUser } from '@/contexts/user.context';
import { Button, Card, Text } from '@nextui-org/react';

export default function NotifContainer({ decline, cancel }: { decline: boolean, cancel: boolean }) {
    const { opponent, setShowNotif } = useNotif();
    const { socket } = useUser();

    async function handleAccept() {
        socket.emit('acceptDuel', opponent);
    }

    async function handleDecline() {
        socket.emit('declineDuel', opponent);
        setShowNotif(false);
    }

    if (cancel) {
        return (
            <Card>
                <Card.Header>Duel Request Canceled</Card.Header>

                <Card.Body>
                    <Text>{opponent.name} canceled the duel (they missclicked probably)</Text>
                    <Button color="primary" onPress={() => setShowNotif(false)}>Ok</Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header>Duel Request</Card.Header>

            <Card.Body>
                {(!decline) ? (<>
                    <Text>{opponent.name} asked for a duel</Text>
                    <Button onPress={handleAccept} color="success">Accept</Button>
                    <Button onPress={handleDecline} color="error">Decline</Button>
                </>): (<>
                        <Text>{opponent.name} declined the duel (very cringe)</Text>
                        <Button color="primary" onPress={() => setShowNotif(false)}>Ok</Button>
                    </>)}
            </Card.Body>
        </Card>
    );
}
