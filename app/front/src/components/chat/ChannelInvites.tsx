import { useChat } from '@/contexts/chat.context';
import { Grid, Text } from '@nextui-org/react';
import React, { useEffect } from 'react';
import ChannelEntry from './ChannelEntry';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useUser } from '@/contexts/user.context';
import axios from 'axios';
import { Channel } from '@/interfaces/chat.interfaces';

interface ChannelInvitesProps {

}

const ChannelInvites: React.FC<ChannelInvitesProps> = ({ }) => {
    const { channelInvites } = useChat();
    const { user } = useUser();

    if (channelInvites.length === 0) {
        return <></>;
    }

    return (
        <>
            <Text h4>Channel invites</Text>
            <hr />
            <ul>
                {channelInvites.map((invite) => (
                    <li className="list-none" key={invite.id}>
                        <Grid.Container>
                            <Grid xs={10}>
                                <ChannelEntry
                                    channel={invite}
                                    banned={false}
                                    muted={false}
                                    isSelected={false}
                                    unreadMessages={0}
                                    key={invite.id}
                                    onClick={() => { }}
                                />
                            </Grid>
                            <Grid xs={1}>
                                <IconCheck className="my-auto" onClick={() => {
                                    axios.put(`http://paul-f4br5s1:3000/channel/${invite.id}/invite`, { id: invite.id }, { withCredentials: true })
                                }} />
                            </Grid>
                            <Grid className="my-auto" xs={1}>
                                <IconX onClick={() => {
                                    axios.delete(`http://paul-f4br5s1:3000/channel/${invite.id}/invite`, { withCredentials: true })
                                }} />
                            </Grid>
                        </Grid.Container>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default ChannelInvites;