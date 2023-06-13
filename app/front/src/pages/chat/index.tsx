import React, { useEffect, useState } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import ChatLayout from "./layout";

const Chat: React.FC = () => {
	const { socket, user } = useUser();

    // Wait for the socket to be initialized
    // if (socket && user.id) {
        // User cannot be null as we redirect to /auth if not logged in
        return (
            <ChatLayout>
                {/* ¯\_(ツ)_/¯ */}
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-3xl font-bold">Select a channel or click on a user to start chatting !</h1>
                </div>
            </ChatLayout>
        );
    // }

    // If the socket is not initialized, show nothing
    // return (<></>);
};

export default Chat;