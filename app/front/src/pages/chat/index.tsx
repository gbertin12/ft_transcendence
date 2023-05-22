import React, { useEffect, useState } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";
import io from 'socket.io-client';
import { Channel, User } from "@/interfaces/chat.interfaces";

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

const Chat: React.FC = () => {
	const socket = useSocket('http://localhost:8001');
    const [channels, setChannels] = useState<Channel[] | null>(null);
    const [user, setUser] = useState<User>({} as User);

    useEffect(() => {
        fetch("http://localhost:3000/user/me", { credentials: "include" })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/auth";
                }
                return res;
            })
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
            });
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
                socket={socket}
                channels={channels}
                user={user}
                setChannels={setChannels}
            />
        );
    }

    // If the socket is not initialized, show nothing
    return (<></>);
};

export default Chat;