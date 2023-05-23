import { Grid, Text } from "@nextui-org/react";
import ChannelCreateIcon from "./icons/ChannelCreateIcon";
import ChatChannelBrowser from "./ChatChannelBrowser";
import { useCallback, useEffect, useState } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import { useSocket } from "@/contexts/socket.context";

const ChannelList: React.FC<any> = () => {
    const { socket } = useSocket();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel>();

    const handleChannelChange = useCallback((channel: Channel) => {
        setSelectedChannel(channel);
        socket.emit('join', {
            channel: selectedChannel?.id,
        });
    }, []);

    useEffect(() => {
        if (channels.length > 0) {
            setSelectedChannel(channels[0]);
        }
    }, []);

    useEffect(() => {
        fetch("http://localhost:3000/channel/all", { credentials: "include" })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/auth";
                }
                return res;
            })
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
            });
    }, []);

    useEffect(() => {
        // Listen for new messages
        // socket.on('message', (payload: Message) => {
        //     console.log("Received message", payload);
        //     setMessages((messages) => [payload, ...messages]);
        // });
        socket.on('newChannel', (payload: Channel) => {
            setChannels((channels) => [...channels, payload]);
        });
        socket.on('deleteChannel', (payload: number) => {
            setChannels((channels) => channels.filter((c) => c.id !== payload));
            if (selectedChannel?.id === payload) {
                setSelectedChannel(channels[0]);
            }
        });
        socket.on('editChannel', (payload: any) => {
            setChannels((channels) => channels.map((c) => c.id === payload.id ? payload : c));
        });
        return () => {
            socket.off('message');
            socket.off('newChannel');
            socket.off('deleteChannel');
            socket.off('editChannel');
        }
    }, [socket]);

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

            {/* TODO: Display latest chats with friends */}
            <ChatChannelBrowser
                channels={channels}
                channelChanged={handleChannelChange}
            />
        </>
    )
}

export default ChannelList;