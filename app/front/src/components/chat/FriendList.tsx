import React from "react";
import { Text, Grid } from "@nextui-org/react";
import ChatFriendBrowser from "./ChatFriendBrowser";

const FriendList: React.FC = () => {
    return (
        <>
            <Text h3>Friends</Text>
            <hr />
            <ChatFriendBrowser />
        </>
    );
};

export default FriendList;