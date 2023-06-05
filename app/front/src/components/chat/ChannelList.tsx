import { Grid, Text } from "@nextui-org/react";
import ChannelCreateIcon from "./icons/ChannelCreateIcon";
import ChatChannelBrowser from "./ChatChannelBrowser";
import { useCallback, useEffect, useState } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import { useRouter } from "next/router";
import { useChat } from "@/contexts/chat.context";
import { useUser } from "@/contexts/user.context";


const ChannelList: React.FC<any> = () => {
    const { socket } = useUser();
    const { channels } = useChat();
    const router = useRouter();

    const handleChannelChange = useCallback((channel: Channel) => {
        router.push(`/chat/channel/${channel.id}`, undefined, { shallow: true });
        socket.emit('join', {
            channel: channel.id,
        });
    }, []);

    return (
        <>
            <Text h3>Chats</Text>
            <hr />
            <Grid.Container>
                <Grid xs={10}>
                    <Text h4>Salons</Text>
                </Grid>
                <ChannelCreateIcon />
            </Grid.Container>

            {/* TODO: Display latest chats with friends and channel invites */}
            <ChatChannelBrowser
                channels={channels}
                channelChanged={handleChannelChange}
            />
        </>
    )
}

export default ChannelList;