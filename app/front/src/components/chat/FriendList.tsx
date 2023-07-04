import React from "react";
import { Text, Grid, Container } from "@nextui-org/react";
import ChatFriendBrowser from "./ChatFriendBrowser";
import FriendRequests from "./FriendRequests";
import { Friend } from "@/interfaces/chat.interfaces";


const FriendList: React.FC<any> = () => {
    return (
        <>
            <Text h3>Friends</Text>
            <hr />
            <Container
                css={{
                    listStyle: "none",
                    padding: 0,
                    height: "85vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <ChatFriendBrowser />
                <FriendRequests />
            </Container>
        </>
    );
};

export default FriendList;