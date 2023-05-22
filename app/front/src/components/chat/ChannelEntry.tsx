import { Badge, Button, Grid, Popover, Text } from '@nextui-org/react';
import React from 'react';
import { FaLock, FaTrash } from 'react-icons/fa';
// import ChannelDeleteIcon from './icons/ChannelDeleteIcon';
import { Channel, User } from '@/interfaces/chat.interfaces';
import ChannelEditIcon from './icons/ChannelEditIcon';

interface ChannelEntryProps {
    isSelected: boolean;
    channel: Channel;
    user: User;
    onClick: () => void;
    unreadMessages?: number;
}

function getBackgroundColor(isHovered: boolean, isSelected: boolean) {
    if (isSelected) {
        return "$accents1";
    }
    if (isHovered) {
        return "$accents2";
    }
    return "transparent";
}

const ChannelEntry: React.FC<ChannelEntryProps> = ({ isSelected, channel, user, onClick, unreadMessages }) => {
    if (unreadMessages === undefined) { unreadMessages = 0; } // default to 0 (ugly hack)

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <Grid.Container
            gap={0.5}
            as="a"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            css={{
                backgroundColor: getBackgroundColor(isHovered, isSelected),
                borderRadius: "5px",
                padding: "5px",
                transition: "background-color 0.05s ease-in-out",
            }}
        >
            <Grid xs={1} css={{ my: "auto" }}>
                <Badge
                    content={unreadMessages > 9 ? "9+" : unreadMessages.toString()}
                    placement="bottom-right"
                    color="error"
                    isInvisible={(unreadMessages === 0)}
                >
                    <Text
                        span
                        size="$3xl"
                        weight="bold"
                    >
                        #
                    </Text>
                </Badge>
            </Grid>
            <Grid xs={8} css={{ my: "auto" }}>
                <Text
                    span
                    size="$xl"
                    weight="bold"
                >
                    {channel.name}
                </Text>
            </Grid>
            {channel.owner_id === user.id && (
                <>
                    <ChannelEditIcon channel={channel} />
                </>
            ) || (
                    // empty grid to keep the icon in the same place
                    <>
                        <Grid xs={1} />
                        <Grid xs={1} />
                    </>
                )}
            {channel.password !== null && ( // TODO: Handle properly passwords (send a boolean rather than a string?)
                <Grid xs={1} css={{ my: "auto" }}>
                    <FaLock />
                </Grid>
            ) || (
                    // empty grid to keep the icon in the same place
                    <Grid xs={1} />
                )
            }
        </Grid.Container >
    );
};

export default ChannelEntry;