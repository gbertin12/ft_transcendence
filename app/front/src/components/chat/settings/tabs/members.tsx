import { Channel, User } from '@/interfaces/chat.interfaces';
import { Spacer, Table, Text } from '@nextui-org/react';
import React from 'react';

interface MembersTabProps {
    channel: Channel;
}

const MembersTab: React.FC<MembersTabProps> = ({ channel }) => {
    const [administrators, setAdministrators] = React.useState<User[]>([]);
    const [members, setMembers] = React.useState<User[]>([]);
    // TODO: Fetch administrators and members on mount
    return (
        <>
            {administrators.length > 0 && (
                <>
                    <Text h3>Administrators</Text>
                    <Table compact>
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
                <Text h3>No administrators</Text>
            )}
            <Spacer y={0.5} />
            {members.length > 0 && (
                <>
                    <Text h3>Members</Text>
                    <Table compact>
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