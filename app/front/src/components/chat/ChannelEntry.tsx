import { Avatar, Badge, Grid, Text } from '@nextui-org/react';
import React from 'react';

interface ChannelEntryProps {
    name: string;
    channelId: number;
    hasPassword: boolean; // TODO: use this to display a lock icon
    ownerId: number;
    unreadMessages?: number;
}

const ChannelEntry: React.FC<ChannelEntryProps> = ({ name, channelId, hasPassword, ownerId, unreadMessages }) => {
    if (unreadMessages === undefined) { unreadMessages = 0; } // default to 0 (ugly hack)
    return (
        <Grid.Container gap={1}>
            <Grid css={{w: "stretch"}} xs={2}>
                <Badge
                    content={unreadMessages > 9 ? "9+" : unreadMessages.toString()}
                    placement="bottom-right"
                    color="error"
                    isInvisible={(unreadMessages === 0)}
                    verticalOffset={22} // XXX: required for some reason (maybe fix it?)
                >
                    <Text h1 weight="bold">#</Text>
                </Badge>
            </Grid>
            <Grid xs={6} css={{my: "auto"}}>
                <Text h3>{name}</Text>
            </Grid>
        </Grid.Container >
    );
};

export default ChannelEntry;