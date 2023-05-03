import { Button, Grid, Loading, Popover } from '@nextui-org/react';
import React from 'react';
import { FaTrash } from 'react-icons/fa';

interface ChannelDeleteIconProps {
    onConfirm: () => void; // confirm channel deletion (button onClick)
}

const ChannelDeleteIcon: React.FC<ChannelDeleteIconProps> = ( { onConfirm }) => {
    const [deleting, setDeleting] = React.useState(false);

    if (deleting) {
        return <Loading size="xs" color="error" />
    }
    return (
        <Popover>
            <Popover.Trigger>
                <Grid xs={1} css={{ my: "auto" }}>
                    <FaTrash />
                </Grid>
            </Popover.Trigger>
            <Popover.Content>
                <Button
                    auto
                    color="error"
                    onClick={() => {
                        setDeleting(true);
                        onConfirm();
                    }}
                >
                    Confirm deletion
                </Button>
            </Popover.Content>
        </Popover>
    )
}

export default ChannelDeleteIcon;