import { Grid } from "@nextui-org/react";
import ChannelList from "../ChannelList";
import { useEffect, useState } from "react";
import { Channel } from "@/interfaces/chat.interfaces";
import { useSocket } from "@/contexts/socket.context";

interface ChannelGridProps {
    channels: Channel[];
}

const ChanneldGrid: React.FC<ChannelGridProps> = ({ channels }) => {
    return (
        <Grid xs={3} direction="column">
            <ChannelList channels={channels} />
        </Grid>
    );
}

export default ChanneldGrid;