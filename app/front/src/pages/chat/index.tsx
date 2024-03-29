import React from "react";
import { useUser } from "@/contexts/user.context";
import ChatLayout from "./layout";

const Chat: React.FC = () => {
    const { socket, user } = useUser();

    // Wait for the socket to be initialized
    if (socket && user.id) {
        // User cannot be null as we redirect to /auth if not logged in
        return (
            <ChatLayout>
                {/* ¯\_(ツ)_/¯ */}
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-3xl font-bold">Select a channel or click on a user to start chatting !</h1>
                </div>
            </ChatLayout>
        );
    } else if (socket && !user.id) {
        // User is null, we are not logged in
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <h1 className="text-3xl font-bold">Not logged in</h1>
                <h3 className="text-xl">You need to be logged in to chat !</h3>
            </div>
        );
    }
    // If the socket is not initialized, show nothing
    return (<></>);
};

export default Chat;