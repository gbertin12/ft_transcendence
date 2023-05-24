import ChanneldGrid from "@/components/chat/grids/ChannelsGrid";
import FriendGrid from "@/components/chat/grids/FriendGrid";
import { ChatContextProvider, useChat } from "@/contexts/chat.context";
import { useSocket } from "@/contexts/socket.context";
import { Channel, Friend } from "@/interfaces/chat.interfaces";
import { Container, Grid } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket();

    return (
        <Grid.Container css={{ "mx": "$4" }}>
            <ChanneldGrid />
            <Grid xs={6} direction="column">
                {children}
            </Grid>
            <FriendGrid />
        </Grid.Container>
    );
}