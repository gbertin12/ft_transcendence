import { Avatar, Container } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";

const fakeChats = [...Array(10)]

const ChatBrowser: React.FC = () => {
    return (
        <Container css={{p: 0}}>
            {fakeChats.map((_, index) => (
                <ChatEntry key={index} />
            ))}
        </Container>
    );
};

export default ChatBrowser;