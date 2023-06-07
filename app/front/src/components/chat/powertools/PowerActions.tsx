import { useUser } from '@/contexts/user.context';
import { Channel, MessageData, PowerAction, SenderData, User } from '@/interfaces/chat.interfaces';
import { Button, Grid, Tooltip } from '@nextui-org/react';
import { IconVolume3, IconTrash, IconBan, IconDoorExit, IconMessageCircleOff, IconUserX } from '@tabler/icons-react';
import React from 'react';
import { Socket } from 'socket.io-client';
import PowerButton from './PowerButton';

interface PowerActionsProps {
    channel: Channel;
    message: MessageData;
    sender: SenderData;
    isAuthor: boolean;
    isAdmin: boolean;
    isOwner: boolean;
}

function emitPowerAction(channel: Channel, action: PowerAction, socket: Socket, targetSender?: SenderData, targetMessage?: MessageData) {
    if (!targetSender && !targetMessage || targetSender && targetMessage) {
        return;
    }

    if (targetMessage) {
        return socket.emit('powerAction', {
            channel: channel.id,
            action: action,
            targetMessage: targetMessage,
        });
    }

    if (targetSender) {
        return socket.emit('powerAction', {
            channel: channel.id,
            action: action,
            targetSender: targetSender,
        });
    }

}

const PowerActions: React.FC<PowerActionsProps> = ({ channel, sender, message, isAuthor, isAdmin, isOwner }) => {
    const { socket } = useUser();

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
                <PowerButton
                    tooltip="Block user"
                    ariaLabel="Block the sender of this message"
                    icon={<IconMessageCircleOff />}
                    color="default"
                    render={true}
                    onPress={() => emitPowerAction(channel, "blocked", socket, sender)}
                />
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
                    icon={<IconUserX />}
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
};

export default PowerActions;