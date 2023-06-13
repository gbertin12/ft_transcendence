import React from "react";
import { Text, Grid } from "@nextui-org/react";
import ChatFriendBrowser from "./ChatFriendBrowser";
import FriendRequests from "./FriendRequests";
import { Friend } from "@/interfaces/chat.interfaces";
import { useSocket } from "@/contexts/socket.context";


const FriendList: React.FC<any> = () => {
    return (
        <>
            <Text h3>Friends</Text>
            <hr />
            <ChatFriendBrowser />
            <FriendRequests />
        </>
    );
};

export default FriendList;