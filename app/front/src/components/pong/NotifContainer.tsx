import { useNotif } from '@/contexts/notif.context';
import { useUser } from '@/contexts/user.context';
import { Button, Card, Text } from '@nextui-org/react';

export default function NotifContainer() {
    const { opponent } = useNotif();
    const { socket } = useUser();

    async function handleAccept() {
        socket.emit('acceptDuel', opponent);
    }

    async function handleDecline() {
        socket.emit('declineDuel', opponent);
    }

    return (
        <Card>
            <Card.Header>Duel Request</Card.Header>

            <Card.Body>
                <Text>{opponent.name} asked for a duel</Text>
                <Button onPress={handleAccept} color="success">Accept</Button>
                <Button onPress={handleDecline} color="error">Decline</Button>
            </Card.Body>
        </Card>
    );
}
