import { useUser } from '@/contexts/user.context';
import { Channel, MessageData, PowerAction, SenderData, User } from '@/interfaces/chat.interfaces';
import { Grid } from '@nextui-org/react';
import { IconVolume3, IconTrash, IconBan, IconDoorExit, IconUserX, IconUser } from '@tabler/icons-react';
import React from 'react';
import { Socket } from 'socket.io-client';
import PowerButton from './PowerButton';
import axios from 'axios';
import PowerModal from './PowerModal';

interface PowerActionsProps {
    channel?: Channel;
    interlocutor?: User;
    message: MessageData;
    sender: SenderData;
    isAuthor: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    blocked: boolean;
}

function emitPowerAction(
    channel: Channel,
    action: PowerAction,
    targetSender?: SenderData,
    targetMessage?: MessageData,
) {
    if (!targetSender && !targetMessage || targetSender && targetMessage) {
        return;
    }

    if (targetMessage) {
        switch (action) {
            case 'deleted':
                axios.delete(`http://paul-f4br5s1:3000/channel/${channel.id}/${targetMessage.message_id}`,
                {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway 
                break;
            default: // ?
                return;
        }
    }
}

const PowerActions: React.FC<PowerActionsProps> = ({ channel, interlocutor, message, sender, isAuthor, isAdmin, isOwner, blocked }) => {
    const { user, socket } = useUser();
    const [powerModalOpen, setPowerModalOpen] = React.useState(false);
    const [powerAction, setPowerAction] = React.useState<PowerAction>("banned");

    if (channel) { // Private / public channels
        return (
            <Grid.Container
                gap={0.5}
                css={{
                    backgroundColor: "$accents2",
                    borderRadius: "$3xl",
                }}
                justify='center'
                alignItems='center'
            >
                <Grid>
                {!isAuthor && !blocked && (
                        <PowerButton
                            tooltip="Block user"
                            ariaLabel="Block the sender of this message"
                            icon={<IconUserX />}
                            color="default"
                            render={true}
                            onPress={() => {
                                axios.post(`http://paul-f4br5s1:3000/friends/block/${sender.id}`, {}, {
                                    withCredentials: true,
                                    validateStatus: () => true,
                                })
                            }}
                        />
                    ) || blocked && (
                        <PowerButton
                            tooltip="Unblock user"
                            ariaLabel="Unblock the sender of this message"
                            icon={<IconUser />}
                            color="default"
                            render={true}
                            onPress={() => {
                                axios.post(`http://paul-f4br5s1:3000/friends/unblock/${sender.id}`, {}, {
                                    withCredentials: true,
                                    validateStatus: () => true,
                                })
                            }}
                        />
                    )}
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Delete message"
                        ariaLabel='Delete this message'
                        icon={<IconTrash />}
                        color="default"
                        render={isAuthor || ((isAdmin || isOwner) && sender.id !== channel.owner_id)}
                        onPress={() => emitPowerAction(channel, "deleted", undefined, message)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Mute user"
                        ariaLabel='Mute this user'
                        tooltipColor="error"
                        icon={<IconVolume3 />}
                        color="error"
                        render={(isOwner || isAdmin && sender.id !== channel.owner_id) && !isAuthor}
                        onPress={() => {
                            setPowerAction("muted");
                            setPowerModalOpen(true);
                        }}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Ban user"
                        ariaLabel='Ban this user'
                        tooltipColor="error"
                        icon={<IconBan />}
                        color="error"
                        render={(isOwner || isAdmin && sender.id !== channel.owner_id) && !isAuthor}
                        onPress={() => {
                            setPowerAction("banned");
                            setPowerModalOpen(true);
                        }}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Kick user"
                        ariaLabel='Kick this user'
                        tooltipColor="error"
                        icon={<IconDoorExit />}
                        color="error"
                        render={(isOwner || isAdmin) && !isAuthor && channel.private}
                        onPress={() => {
                            setPowerAction("kicked");
                            setPowerModalOpen(true);
                        }}
                    />
                </Grid>

                <PowerModal
                    open={powerModalOpen}
                    onClose={() => setPowerModalOpen(false)}
                    punished={sender}
                    channel={channel}
                    type={powerAction}
                />
            </Grid.Container>
        );
    } else if (interlocutor) { // DM mode
        return (
            <Grid.Container
                gap={0.5}
                css={{
                    backgroundColor: "$accents2",
                    borderRadius: "$3xl",
                }}
                justify='center'
                alignItems='center'
            >
                <Grid>
                    {!blocked && (
                        <PowerButton
                            tooltip="Block user"
                            ariaLabel="Block the sender of this message"
                            icon={<IconUserX />}
                            color="default"
                            render={true}
                            onPress={() => {
                                axios.post(`http://paul-f4br5s1:3000/friends/block/${sender.id}`, {}, {
                                    withCredentials: true,
                                    validateStatus: () => true,
                                })
                            }}
                        />
                    ) || (
                        <PowerButton
                            tooltip="Unblock user"
                            ariaLabel="Unblock the sender of this message"
                            icon={<IconUser />}
                            color="default"
                            render={true}
                            onPress={() => {
                                axios.post(`http://paul-f4br5s1:3000/friends/unblock/${sender.id}`, {}, {
                                    withCredentials: true,
                                    validateStatus: () => true,
                                })
                            }}
                        />
                    )}
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Delete message"
                        ariaLabel='Delete this message'
                        icon={<IconTrash />}
                        color="default"
                        render={isAuthor || isAdmin || isOwner}
                        onPress={() => socket.emit('dmDelete', {
                            interlocutor: interlocutor.id,
                            message_id: message.message_id,
                        })}
                    />
                </Grid>
            </Grid.Container>
        )
    } else {
        return <></>;
    }
};

export default PowerActions;
