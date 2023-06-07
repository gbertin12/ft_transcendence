import { Avatar, Container, Loading, Text } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import ChannelEntry from "./ChannelEntry";
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import { useChat } from "@/contexts/chat.context";

interface ChatChannelBrowserProps {
    channelChanged: (channel: Channel) => void;
    channels?: Channel[];
}

const ChatChannelBrowser: React.FC<ChatChannelBrowserProps> = ({ channelChanged, channels }) => {
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    const { user } = useUser();
    const { bannedChannels } = useChat();

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
                    channel={channel}
                    banned={bannedChannels.has(channel.id)}
                    unreadMessages={0}  // todo: return this value with the backend
                    onClick={() => {
                        if (bannedChannels.has(channel.id)) {
                            return ;
                        }
                        setSelectedIndex(index);
                        channelChanged(channel);
                    }}
                    isSelected={selectedIndex === index}
                    user={user}
                />
            ))}
        </Container>
    );
};

export default ChatChannelBrowser;