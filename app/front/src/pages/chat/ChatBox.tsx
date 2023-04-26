import React, { useEffect, useState } from "react";
import { Channel, Message } from "@/interfaces/chat.interfaces";
import io from 'socket.io-client';
import { Avatar, Container, Grid, Text } from "@nextui-org/react";
import Chats from "@/components/chat/ChatBrowser";
import ChatBrowser from "@/components/chat/ChatBrowser";


interface ChatBoxProps {
    privateMessages: string[];
    muted?: boolean | undefined;
}

function useSocket(url: string) {
    const [socket, setSocket] = useState<any>();
    useEffect(() => {
        const socketIo = io(url);
        setSocket(socketIo);
        function cleanup() {
            socketIo.disconnect()
        }
        return cleanup
    }, [])
    return socket
}

const ChatBox: React.FC<ChatBoxProps> = ({ muted, privateMessages }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel>();
    const [isPrivateMessage, setIsPrivateMessage] = useState(false);

    // ghostMessages is used to display the message before it is sent to the server
    const [ghostMessages, setGhostMessage] = useState<string[]>([]);

    // Workaround to not re-create the socket on every render
    const socket = useSocket('http://localhost:8001');

    const fetchMessages = (channelId: number) => {
        fetch(`http://localhost:3001/channel/${channelId}/messages`)
            .then((res) => res.json())
            .then((data) => {
                setMessages(data);
            });
    };

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:3001/channel/all")
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
                setSelectedChannel(data[0]);
                setLoading(false);
            });

        // Listen for new messages
        if (socket) {
            socket.on('message', (payload: any) => {
                setMessages((messages) => [payload.message, ...messages]);
            });
        }
    }, [socket]);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id);
            socket.emit('join', {
                channel: selectedChannel.id,
            });
        }
    }, [selectedChannel]);


    const handleNewMessage = (message: string) => {
        // Add ghost message
        setGhostMessage([...ghostMessages, message]);

        // POST request to send the message to the server
        fetch(`http://localhost:3001/channel/${selectedChannel?.id}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: message }),
        }) // TODO: check that API sent a 200
            .then((res) => res.json())
            .then((data) => {
                // Remove ghost message
                setGhostMessage(ghostMessages.filter((msg) => msg !== message));
                // Emit message to the server using socket.io
                socket.emit('message', {
                    message: data,
                });
            });
    };

    const handleChannelChange = (index: number) => {
        const newChannel = channels[index];
        setSelectedChannel(newChannel);
        setIsPrivateMessage(index >= channels.length);
        fetchMessages(newChannel.id); // TODO: Replace with socket.io
    };

    return (
        <Container>
            <Grid.Container gap={2} justify="center" css={{height: "100vh"}}>
                <Grid xs={3} direction="column">
                    <Text h3>Chats</Text>
                    <hr />
                    <ChatBrowser />
                </Grid>
                <Grid xs={6}>
                    <Grid.Container>
                        <Text h3 css={{ mx: "auto" }}>Current Chat</Text>
                    </Grid.Container>
                </Grid>
                <Grid xs={3}>
                    <Grid.Container>
                        <Text h3 css={{ mx: "auto" }}>Friends</Text>
                    </Grid.Container>
                </Grid>
            </Grid.Container>
        </Container>
    );
};

export default ChatBox;
