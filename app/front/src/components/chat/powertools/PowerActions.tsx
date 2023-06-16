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
    socket: Socket,
    targetSender?: SenderData,
    targetMessage?: MessageData,
) {
    if (!targetSender && !targetMessage || targetSender && targetMessage) {
        return;
    }

    if (targetMessage) {
        return socket.emit('powerAction', {
            channel: channel.id,
            action: action,
            targetMessage: targetMessage,
            dm: false,
        });
    }

    if (targetSender) {
        return socket.emit('powerAction', {
            channel: channel.id,
            action: action,
            targetSender: targetSender,
            dm: false,
        });
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
                        onPress={() => emitPowerAction(channel, "deleted", socket, undefined, message)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Mute user"
                        ariaLabel='Mute this user'
                        tooltipColor="error"
                        icon={<IconVolume3 />}
                        color="error"
                        render={isOwner || isAdmin}
                        onPress={() => emitPowerAction(channel, "muted", socket, sender)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Ban user"
                        ariaLabel='Ban this user'
                        tooltipColor="error"
                        icon={<IconBan />}
                        color="error"
                        render={isOwner || isAdmin}
                        onPress={() => emitPowerAction(channel, "banned", socket, sender)}
                    />
                </Grid>
                <Grid>
                    <PowerButton
                        tooltip="Kick user"
                        ariaLabel='Kick this user'
                        tooltipColor="error"
                        icon={<IconDoorExit />}
                        color="error"
                        render={isOwner || isAdmin}
                        onPress={() => emitPowerAction(channel, "kicked", socket, sender)}
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