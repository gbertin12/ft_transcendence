import React, { useEffect, useState } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import { useSocket } from "@/contexts/socket.context";

const Chat: React.FC = () => {
	const { socket } = useSocket();
    const { user } = useUser();
    const [channels, setChannels] = useState<Channel[]>([]);

    useEffect(() => {
        console.log(user);
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

    // Wait for the socket to be initialized
    if (socket && channels) {
        // User cannot be null as we redirect to /auth if not logged in
        return (
            <ChatBox
                channels={channels}
                setChannels={setChannels}
            />
        );
    }

    // If the socket is not initialized, show nothing
    return (<></>);
};

export default Chat;