import { useUser } from '@/contexts/user.context';
import { Channel, MessageData, PowerAction, SenderData, User } from '@/interfaces/chat.interfaces';
import { Button, Grid, Tooltip } from '@nextui-org/react';
import { IconVolume3, IconTrash, IconBan, IconDoorExit, IconMessageCircleOff, IconUserX } from '@tabler/icons-react';
import React from 'react';
import { Socket } from 'socket.io-client';

interface PowerActionsProps {
    channel: Channel;
    message: MessageData;
    sender: SenderData;
    isAuthor: boolean;
    isAdmin: boolean;
    isOwner: boolean;
}

interface PowerButtonProps {
    icon: React.ReactNode;
    color: string;
    ariaLabel: string;
    onPress?: () => void;
    render?: boolean;
    tooltip?: string;
    tooltipColor?: string;
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
            targetSender: targetSender.id,
        });
    }

}

const PowerButton: React.FC<PowerButtonProps> = ({ icon, color, ariaLabel, tooltip, tooltipColor, onPress, render = true }) => {
    if (!render) {
        return <></>;
    }
    if (tooltip) {
        return (
            <Tooltip content={tooltip} placement="top" color={tooltipColor as any}>
                <Button
                    light
                    auto
                    color={color as any}
                    aria-label={ariaLabel}
                    css={{
                        borderRadius: "$3xl",
                        padding: "0.25rem",
                    }}
                    onPress={onPress}
                >
                    {icon}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            light
            auto
            color={color as any}
            css={{
                borderRadius: "$3xl",
                padding: "0.25rem",
            }}
        >
            {icon}
        </Button>
    );
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
                    onPress={() => emitPowerAction(channel, "block", socket, sender)}
                />
            </Grid>
            <Grid>
                <PowerButton
                    tooltip="Delete message"
                    ariaLabel='Delete this message'
                    icon={<IconTrash />}
                    color="default"
                    render={isAuthor || isAdmin || isOwner}
                    onPress={() => emitPowerAction(channel, "delete", socket, undefined, message)}
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
                    onPress={() => emitPowerAction(channel, "mute", socket, sender)}
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
                    onPress={() => emitPowerAction(channel, "ban", socket, sender)}
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
                    onPress={() => emitPowerAction(channel, "kick", socket, sender)}
                />
            </Grid>
        </Grid.Container>
    );
};

export default PowerActions;