import { Avatar, Container } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import ChannelEntry from "./ChannelEntry";

const ChatChannelBrowser: React.FC = () => {
    return (
        <Container css={{p: 0}}>
            <ChannelEntry
                name="general"
                channelId={0}
                hasPassword={false}
                ownerId={0}
                unreadMessages={1}
            />
        </Container>
    );
};

export default ChatChannelBrowser;