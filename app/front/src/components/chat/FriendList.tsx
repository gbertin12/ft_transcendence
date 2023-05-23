import React from "react";
import { Text, Grid } from "@nextui-org/react";
import ChatFriendBrowser from "./ChatFriendBrowser";
import FriendRequests from "./FriendRequests";
import { Friend } from "@/interfaces/chat.interfaces";

interface FriendListProps {
    friends: Friend[];
}

const FriendList: React.FC<FriendListProps> = ({ friends }) => {
    return (
        <>
            <Text h3>Friends</Text>
            <hr />
            <ChatFriendBrowser friends={friends} />
            <FriendRequests />
        </>
    );
};

export default FriendList;