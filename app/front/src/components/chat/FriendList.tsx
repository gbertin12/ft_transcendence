import React from "react";
import { Text, Grid } from "@nextui-org/react";
import ChatFriendBrowser from "./ChatFriendBrowser";
import FriendRequests from "./FriendRequests";

const FriendList: React.FC = () => {
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