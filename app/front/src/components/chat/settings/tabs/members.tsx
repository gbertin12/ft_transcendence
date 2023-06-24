import AvatarTooltip from '@/components/profile/AvatarTooltip';
import { useUser } from '@/contexts/user.context';
import { Channel, User } from '@/interfaces/chat.interfaces';
import { Button, Container, Dropdown, Spacer, Table, Text } from '@nextui-org/react';
import { IconArrowsTransferUp, IconShield, IconShieldDown, IconShieldUp } from '@tabler/icons-react';
import axios from 'axios';
import React, { Key, useEffect } from 'react';
import OwnershipModal from '../OwnershipModal';

interface MembersTabProps {
    channel: Channel;
}

function updateRole(user_id: number, role: string, channel_id: number): Promise<boolean> {
    // Returns true if the role was updated successfully
    return axios.patch(`http://localhost:3000/channel/${channel_id}/update_role`, {
        user_id: user_id,
        role: role
    }, {
        withCredentials: true,
    }).then((response) => {
        return true;
    }).catch((error) => {
        return false;
    });
}

const MembersTab: React.FC<MembersTabProps> = ({ channel }) => {
    const [owner, setOwner] = React.useState<User | null>(null);
    const [administrators, setAdministrators] = React.useState<User[]>([]);
    const [members, setMembers] = React.useState<User[]>([]);
    const [ownershipModal, setOwnershipModal] = React.useState<boolean>(false);
    const [selectedUser, setSelectedUser] = React.useState<User>({} as User); // will contain the user to receive the ownership

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
                            <Table.Column css={{ "w": "70%" }} align='start'>Username</Table.Column>
                            <Table.Column align='center'>Role</Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {administrators.map((currentUser) => (
                                <Table.Row key={currentUser.id}>
                                    <Table.Cell>
                                        {currentUser.name}
                                    </Table.Cell>
                                    <Table.Cell css={{ ta: "center" }}>
                                        <Dropdown>
                                            <Dropdown.Button flat color="secondary" css={{ w: "stretch" }}>
                                                Administrator
                                            </Dropdown.Button>
                                            <Dropdown.Menu disabledKeys={(user.id !== channel.owner_id ? ['to-owner', 'to-member'] : [])} onAction={(key: Key) => {
                                                switch (key) {
                                                    case 'to-owner':
                                                        setSelectedUser(currentUser);
                                                        setOwnershipModal(true);
                                                        break;
                                                    case 'to-member':
                                                        updateRole(currentUser.id, 'member', channel.id).then((success) => {
                                                            if (success) {
                                                                setMembers([...members, currentUser]);
                                                                setAdministrators(administrators.filter((admin) => admin.id !== currentUser.id));
                                                            }
                                                        });
                                                }
                                            }}>
                                                <Dropdown.Item key="to-owner" icon={<IconArrowsTransferUp size={16} />}>
                                                    Transfer ownership
                                                </Dropdown.Item>
                                                <Dropdown.Item key="to-member" icon={<IconShieldDown size={16} />}>
                                                    Demote to member
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
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
                            <Table.Column css={{ "w": "70%" }} align='start'>Username</Table.Column>
                            <Table.Column align='center'>Role</Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {/* List of members */}
                            {members.map((currentUser) => (
                                <Table.Row key={currentUser.id}>
                                    <Table.Cell>
                                        {currentUser.name}
                                    </Table.Cell>
                                    <Table.Cell css={{ ta: "center" }}>
                                        <Dropdown>
                                            <Dropdown.Button flat color="secondary" css={{ w: "stretch" }}>
                                                Member
                                            </Dropdown.Button>
                                            <Dropdown.Menu disabledKeys={(user.id !== channel.owner_id ? ['to-owner', 'to-member'] : [])} onAction={(key: Key) => {
                                                switch (key) {
                                                    case 'to-owner':
                                                        setSelectedUser(currentUser);
                                                        setOwnershipModal(true);
                                                        break;
                                                    case 'to-admin':
                                                        updateRole(currentUser.id, 'admin', channel.id).then((success) => {
                                                            if (success) {
                                                                setAdministrators([...administrators, currentUser]);
                                                                setMembers(members.filter((member) => member.id !== currentUser.id));
                                                            }
                                                        });
                                                }
                                            }}>
                                                <Dropdown.Item key="to-owner" icon={<IconArrowsTransferUp size={16} />}>
                                                    Transfer ownership
                                                </Dropdown.Item>
                                                <Dropdown.Item key="to-admin" icon={<IconShieldUp size={16} />}>
                                                    Promote to administrator
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        <Table.Pagination align='start' rowsPerPage={5} />
                    </Table>
                </>
            ) || (
                    <Text h3>No members</Text>
                )}
            <OwnershipModal
                channel={channel}
                open={ownershipModal}
                onClose={() => setOwnershipModal(false)}
                futureOwner={selectedUser}
            />
        </>
    );
};

export default MembersTab;