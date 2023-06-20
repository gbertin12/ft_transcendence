import { useUser } from '@/contexts/user.context';
import { Channel, MessageData, PowerAction, SenderData, User } from '@/interfaces/chat.interfaces';
import { Grid } from '@nextui-org/react';
import { IconVolume3, IconTrash, IconBan, IconDoorExit, IconUserX, IconUser } from '@tabler/icons-react';
import React from 'react';
import { Socket } from 'socket.io-client';
import PowerButton from './PowerButton';
import axios from 'axios';

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
    duration: number = -1,
) {
    if (!targetSender && !targetMessage || targetSender && targetMessage) {
        return;
    }

    if (targetMessage) {
        switch (action) {
            case 'deleted':
                axios.delete(`http://localhost:3000/channel/${channel.id}/${targetMessage.message_id}`,
                {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway 
                break;
            default: // ?
                return;
        }
    }

    let durationSeconds: number = (duration > 0) ? duration : 365 * 24 * 60 * 60 * 5; // 5 years (permanent)

    if (targetSender) {
        switch (action) {
            case 'banned':
                axios.put(`http://localhost:3000/channel/${channel.id}/ban/${targetSender.id}`,
                {
                    duration: durationSeconds,
                }, {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway
                break;
            case 'kicked':
                axios.put(`http://localhost:3000/channel/${channel.id}/kick/${targetSender.id}`,
                null,
                {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway
                break;
            case 'muted':
                axios.put(`http://localhost:3000/channel/${channel.id}/mute/${targetSender.id}`,
                {
                    duration: durationSeconds,
                }, {
                    withCredentials: true,
                    validateStatus: () => true // The front won't display buttons if the user
                })                             // is not allowed to use them anyway
                break;
            default:
                break;
        }
    }
}

const PowerActions: React.FC<PowerActionsProps> = ({ channel, interlocutor, message, sender, isAuthor, isAdmin, isOwner, blocked }) => {
    const { socket } = useUser();
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
                                axios.post(`http://localhost:3000/friends/block/${sender.id}`, {}, {
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
                                axios.post(`http://localhost:3000/friends/unblock/${sender.id}`, {}, {
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
                        render={(isOwner || isAdmin) && !isAuthor}
                        onPress={() => emitPowerAction(channel, "muted", sender)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Ban user"
                        ariaLabel='Ban this user'
                        tooltipColor="error"
                        icon={<IconBan />}
                        color="error"
                        render={(isOwner || isAdmin) && !isAuthor}
                        onPress={() => emitPowerAction(channel, "banned", sender)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Kick user"
                        ariaLabel='Kick this user'
                        tooltipColor="error"
                        icon={<IconDoorExit />}
                        color="error"
                        render={(isOwner || isAdmin) && !isAuthor}
                        onPress={() => emitPowerAction(channel, "kicked", sender)}
                    />
                </Grid>
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
                                axios.post(`http://localhost:3000/friends/block/${sender.id}`, {}, {
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
                                axios.post(`http://localhost:3000/friends/unblock/${sender.id}`, {}, {
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