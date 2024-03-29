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
    const { publicChannels, privateChannels } = useChat();
    const router = useRouter();

    const handleChannelChange = useCallback((channel: Channel) => {
        router.push(`/chat/channel/${channel.id}`, undefined, { shallow: true });
    }, [router]);

    return (
        <Container
            css={{
                listStyle: "none",
                padding: 0,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <hr />
            <Grid.Container>
                <Grid xs={10}>
                    <Text h3>Channels</Text>
                </Grid>
                <ChannelCreateIcon />
            </Grid.Container>
            <hr />
                {privateChannels.length >= 1 && (
                    <>
                        <Text h3>Private Channels</Text>
                        <ChatChannelBrowser
                            privateOnly
                            channelChanged={handleChannelChange}
                        />
                    </>
                )}
                {publicChannels.length >= 1 && (
                    <>
                        <Text h3>Public Channels</Text>
                        <ChatChannelBrowser
                            publicOnly
                            channelChanged={handleChannelChange}
                        />
                    </>
                )}
            <ChannelInvites />
        </Container>
    )
}

export default ChannelList;