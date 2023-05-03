import { Button, Grid, Loading, Popover } from '@nextui-org/react';
import React from 'react';
import { FaEdit } from 'react-icons/fa';

interface ChannelEditIconProps {
    onConfirm: () => void; // confirm channel deletion (button onClick)
}

const ChannelEditIcon: React.FC<ChannelEditIconProps> = ( { onConfirm }) => {
    const [deleting, setDeleting] = React.useState(false);

    if (deleting) {
        return <Loading size="xs" color="error" />
    }
    return (
        <Popover>
            <Popover.Trigger>
                <Grid xs={1} css={{ my: "auto" }}>
                    <FaEdit />
                </Grid>
            </Popover.Trigger>
            <Popover.Content>
                
            </Popover.Content>
        </Popover>
    )
}

export default ChannelEditIcon;