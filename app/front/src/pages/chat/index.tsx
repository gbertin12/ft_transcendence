import React, { useEffect, useState } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import { useSocket } from "@/contexts/socket.context";
import ChatLayout from "./layout";

const Chat: React.FC = () => {
	const { socket } = useSocket();
    const { user } = useUser();

    // Wait for the socket to be initialized
    if (socket && user) {
        // User cannot be null as we redirect to /auth if not logged in
        return (
            <ChatLayout>
                <ChatBox />
            </ChatLayout>
        );
    }

    // If the socket is not initialized, show nothing
    return (<></>);
};

export default Chat;