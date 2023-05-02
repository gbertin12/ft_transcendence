import { Badge, Grid, Text, Tooltip } from '@nextui-org/react';
import React from 'react';
import { FaLock, FaTrash } from 'react-icons/fa';

interface ChannelEntryProps {
    name: string;
    channelId: number;
    hasPassword: boolean; // TODO: use this to display a lock icon
    ownerId: number;
    isSelected: boolean;
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

const ChannelEntry: React.FC<ChannelEntryProps> = ({ name, channelId, hasPassword, ownerId, isSelected, onClick, unreadMessages }) => {
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
            <Grid xs={9} css={{ my: "auto" }}>
                <Text
                    span
                    size="$xl"
                    weight="bold"
                >
                    {name}
                </Text>
            </Grid>
            {ownerId === 1 && (
                <Grid xs={1} css={{ my: "auto" }}>
                    <Tooltip
                        content="Delete this channel"
                        placement="bottom"
                        trigger="hover"
                        hideArrow={true}
                    >
                        <FaTrash />
                    </Tooltip>
                </Grid>
            ) || (
                    // empty grid to keep the icon in the same place
                    <Grid xs={1} />
                )}
            {hasPassword && (
                <Grid xs={1} css={{ my: "auto" }}>
                    <Tooltip
                        content="This channel is password protected"
                        placement="bottom"
                        trigger="hover"
                        hideArrow={true}
                    >
                        <FaLock />
                    </Tooltip>
                </Grid>
            ) || (
                    // empty grid to keep the icon in the same place
                    <Grid xs={1} />
                )}
        </Grid.Container >
    );
};

export default ChannelEntry;