import AvatarTooltip from '@/components/profile/AvatarTooltip';
import { useUser } from '@/contexts/user.context';
import { Channel, User } from '@/interfaces/chat.interfaces';
import { Button, Container, Spacer, Table, Text } from '@nextui-org/react';
import axios from 'axios';
import React, { useEffect } from 'react';

interface MembersTabProps {
    channel: Channel;
}

const MembersTab: React.FC<MembersTabProps> = ({ channel }) => {
    const [owner, setOwner] = React.useState<User | null>(null);
    const [administrators, setAdministrators] = React.useState<User[]>([]);
    const [members, setMembers] = React.useState<User[]>([]);
    const { user } = useUser();
    // TODO: Fetch owner, administrators and members on mount

    useEffect(() => {
        axios.get(`http://localhost:3000/channel/${channel.id}/members`,
            {
                withCredentials: true,
                validateStatus: () => true
            },
        ).then((response) => {
            if (response.status === 200) {
                setOwner(response.data.owner)
                setAdministrators(response.data.admins);
                setMembers(response.data.users);
            }
        });
    }, []);

    return (
        <>
            {owner && (
                <Container direction='column' display='flex' alignItems='center'>
                    <AvatarTooltip user={owner} placement="top" />
                    <Text h3>Owner</Text>
                </Container>
            )}
            {administrators.length > 0 && (
                <>
                    <Text h3>Administrators</Text>
                    <Table compact striped>
                        <Table.Header>
                            <Table.Column align='start'>Username</Table.Column>
                            <Table.Column align='center'>Owner Actions</Table.Column>
                            <Table.Column align='center'>Admin Actions</Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {/* List of members */}
                            {administrators.map((currentUser) => (
                                <Table.Row key={currentUser.id}>
                                    <Table.Cell>
                                        {currentUser.name}
                                    </Table.Cell>
                                    <Table.Cell css={{ ta: "center" }}>
                                        <Button.Group color="warning" disabled={user.id !== channel.owner_id}>
                                            <Button>Demote to member</Button>
                                            <Button>Transfer ownership</Button>
                                        </Button.Group>
                                    </Table.Cell>
                                    <Table.Cell css={{ ta: "center" }}>
                                        <Button.Group color="error" disabled={user.id == currentUser.id}>
                                            <Button disabled={channel.private}>Kick</Button>
                                            <Button>Ban</Button>
                                            <Button>Mute</Button>
                                        </Button.Group>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        <Table.Pagination align='start' rowsPerPage={3} />
                    </Table>
                </>
            ) || (
                    <Text h3>No administrators</Text>
                )}
            <Spacer y={0.5} />
            {members.length > 0 && (
                <>
                    <Text h3>Members</Text>
                    <Table compact striped>
                        <Table.Header>
                            <Table.Column>Username</Table.Column>
                            {channel.private && (
                                <Table.Column>Joined</Table.Column>
                            ) || (
                                    <Table.Column>First message</Table.Column>
                                )}
                            <Table.Column>Actions</Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {/* List of members */}
                        </Table.Body>
                        <Table.Pagination align='start' rowsPerPage={5} />
                    </Table>
                </>
            ) || (
                    <Text h3>No members</Text>
                )}
        </>
    );
};

export default MembersTab;