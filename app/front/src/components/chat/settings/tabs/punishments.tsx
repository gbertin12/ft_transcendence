import { Channel, PunishmentData, User } from '@/interfaces/chat.interfaces';
import { Button, Container, Loading, Spacer, Table, Text } from '@nextui-org/react';
import axios from 'axios';
import React, { useEffect } from 'react';

interface PunishmentsTabProps {
    channel: Channel;
}

function formatDate(date: Date): string {
    if (date.getFullYear() - new Date().getFullYear() > 5) {
        return "Never";
    }
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        return `Today ${hours}:${minutes}`;
    }
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
        return `Yesterday ${hours}:${minutes}`;
    }
    return `${date.toLocaleDateString()} at ${hours}:${minutes}`;
}

function typeToString(type: number): string {
    switch (type) {
        case 0:
            return "Ban";
        case 1:
            return "Mute";
        default:
            return "Unknown";
    }
}

const PunishmentsTab: React.FC<PunishmentsTabProps> = ({ channel }) => {
    const [punishments, setPunishments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [working, setWorking] = React.useState<Set<number>>(new Set());

    useEffect(() => {
        setLoading(true);
        axios.get(`http://paul-f4br5s1:3000/channel/${channel.id}/punishments`,
            { withCredentials: true }
        ).then(res => {
            setPunishments(res.data);
            setLoading(false);
        });
    }, [channel])

    if (loading) {
        return (
            <Container display='flex' justify='center'>
                <Loading color='primary' size="lg" />
            </Container>
        );
    }

    return (
        <>
            {punishments.length > 0 && (
                <>
                    <Text h3>Total Punishments : {punishments.length}</Text>
                    <Table compact>
                        <Table.Header>
                            <Table.Column align='start'>Username</Table.Column>
                            <Table.Column align='center'>Punished at (UTC)</Table.Column>
                            <Table.Column align='center'>Expires at (UTC)</Table.Column>
                            <Table.Column align='center'>Punished by</Table.Column>
                            <Table.Column align='center'>Type</Table.Column>
                            <Table.Column align='center'>Actions</Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {punishments.map((punishment, index: number) => (
                                <Table.Row key={index}>
                                    <Table.Cell>{punishment.punished.name}</Table.Cell>
                                    <Table.Cell css={{ta: "center"}}>{formatDate(new Date(punishment.punished_at))}</Table.Cell>
                                    <Table.Cell css={{ta: "center"}}>{formatDate(new Date(punishment.expires_at))}</Table.Cell>
                                    <Table.Cell css={{ta: "center"}}>{punishment.punisher.name}</Table.Cell>
                                    <Table.Cell css={{ta: "center"}}>{typeToString(punishment.type)}</Table.Cell>
                                    <Table.Cell css={{ta: "center"}}>
                                        <Container display='flex' justify='center'>
                                            <Button
                                                css={{ w: "stretch" }}
                                                disabled={working.has(index)}
                                                onPress={() => {
                                                    setWorking(new Set(working).add(index));
                                                    axios.delete(`http://paul-f4br5s1:3000/punishments/${punishment.issuer_id}/${punishment.punished_id}/${punishment.channel_id}`,
                                                        {
                                                            withCredentials: true,
                                                            validateStatus: () => true
                                                        },
                                                    ).then(res => {
                                                        setPunishments(punishments.filter((_, i) => i !== index));
                                                        let newWorking = new Set(working);
                                                        newWorking.delete(index);
                                                        setWorking(newWorking);
                                                    });
                                                }}
                                            >
                                                {working.has(index) ? <Loading type="points" /> : "Revoke"}
                                            </Button>
                                        </Container>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        <Table.Pagination align='start' rowsPerPage={7} />
                    </Table>
                </>
            ) || (
                <Text h3>No punishments</Text>
            )}
        </>
    );
};

export default PunishmentsTab;