import { Badge, Grid, Text } from '@nextui-org/react';
import React from 'react';
import { Channel, User } from '@/interfaces/chat.interfaces';
import { ChannelEditIcon } from './icons/ChannelEditIcon';
import { IconLock } from '@tabler/icons-react';
import { useUser } from '@/contexts/user.context';

interface ChannelEntryProps {
    isSelected: boolean;
    channel: Channel;
    banned: boolean;
    muted: boolean;
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

const ChannelEntry: React.FC<ChannelEntryProps> = ({ isSelected, channel, banned, muted, onClick, unreadMessages }) => {
    if (unreadMessages === undefined) { unreadMessages = 0; } // default to 0 (ugly hack)

    const [isHovered, setIsHovered] = React.useState(false);
    const { user } = useUser();

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
                cursor: (banned) ? "not-allowed" : "pointer",
            }}
        >
            <Grid xs={1} css={{ my: "auto" }}>
                <Badge
                    content={unreadMessages > 9 ? "9+" : unreadMessages.toString()}
                    placement="bottom-right"
                    color="error"
                    css={{ display: (unreadMessages === 0) ? "none" : "" }}
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
                    {(banned) && (
                        <Badge color="error" css={{"mr": "$2"}}>
                            BANNED
                        </Badge>
                    )}
                    {(muted && !banned) && (
                        <Badge color="warning" css={{"mr": "$2"}}>
                            MUTED
                        </Badge>
                    )}
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
                    <IconLock />
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
