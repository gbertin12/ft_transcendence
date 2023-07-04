import { Container, Grid, Text } from "@nextui-org/react";
import ChannelCreateIcon from "./icons/ChannelCreateIcon";
import ChatChannelBrowser from "./ChatChannelBrowser";
import { useCallback, useEffect, useState } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import { useRouter } from "next/router";
import { useChat } from "@/contexts/chat.context";
import { useUser } from "@/contexts/user.context";
import ChannelInvites from "./ChannelInvites";


const ChannelList: React.FC<any> = () => {
    const { socket } = useUser();
    const router = useRouter();

    const handleChannelChange = useCallback((channel: Channel) => {
        router.push(`/chat/channel/${channel.id}`, undefined, { shallow: true });
    }, []);

    return (
        <>
            <hr />
            <Grid.Container>
                <Grid xs={10}>
                    <Text h3>Channels</Text>
                </Grid>
                <ChannelCreateIcon />
            </Grid.Container>
            <hr/>
            <Container
                css={{
                    listStyle: "none",
                    padding: 0,
                    height: "85vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <ChatChannelBrowser
                    publicOnly
                    channelChanged={handleChannelChange}
                />
                <ChatChannelBrowser
                    privateOnly
                    channelChanged={handleChannelChange}
                />
            </Container>
            <ChannelInvites />
        </>
    )
}

export default ChannelList;