import { Avatar, Container, Loading, Text } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import ChannelEntry from "./ChannelEntry";
import { Channel } from "@/interfaces/chat.interfaces";

interface ChatChannelBrowserProps {
    channelChanged: (channel: Channel) => void;
    channels?: Channel[];
}

const ChatChannelBrowser: React.FC<ChatChannelBrowserProps> = ({ channelChanged, channels }) => {
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

    if (!channels) {
        return (
            <Container css={{p: 0}}>
                <Loading />
            </Container>
        );
    }

    return (
        <Container css={{p: 0}}>
            {channels.map((channel, index) => (
                <ChannelEntry
                    key={channel.id}
                    name={channel.name}
                    channelId={channel.id}
                    hasPassword={false} // todo: return this value with the backend
                    ownerId={channel.owner_id}
                    unreadMessages={0}  // todo: return this value with the backend
                    onClick={() => {
                        setSelectedIndex(index);
                        channelChanged(channel);
                    }}
                    isSelected={selectedIndex === index}
                />
            ))}
        </Container>
    );
};

export default ChatChannelBrowser;