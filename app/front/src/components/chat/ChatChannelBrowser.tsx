import { Avatar, Container, Loading, Text } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";
import ChannelEntry from "./ChannelEntry";
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useUser } from "@/contexts/user.context";
import { useChat } from "@/contexts/chat.context";

interface ChatChannelBrowserProps {
    channelChanged: (channel: Channel) => void;
    publicOnly?: boolean;
    privateOnly?: boolean;
}

const ChatChannelBrowser: React.FC<ChatChannelBrowserProps> = ({ channelChanged, publicOnly, privateOnly }) => {
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    const { user } = useUser();
    const { channels, publicChannels, privateChannels, bannedChannels, mutedChannels } = useChat();

    if (!channels) {
        return (
            <Container css={{ p: 0 }}>
                <Loading />
            </Container>
        );
    }

    if (privateOnly) {
        return (
            <Container css={{ p: 0 }}>
                <ul>
                    {privateChannels.map((channel, index) => (
                        <li
                            key={channel.id}
                            style={{
                                margin: 0,
                            }}
                        >
                            <ChannelEntry
                                key={channel.id}
                                channel={channel}
                                banned={bannedChannels.has(channel.id)}
                                muted={mutedChannels.has(channel.id)}
                                unreadMessages={0}  // todo: return this value with the backend
                                onClick={() => {
                                    if (bannedChannels.has(channel.id)) {
                                        return;
                                    }
                                    setSelectedIndex(index);
                                    channelChanged(channel);
                                }}
                                isSelected={selectedIndex === index}
                            />
                        </li>
                    ))}
                </ul>
            </Container>
        );
    }

    if (publicOnly) {
        return (
            <Container css={{ p: 0 }}>
                <ul>
                    {publicChannels.map((channel, index) => (
                        <li
                            key={channel.id}
                            style={{
                                margin: 0,
                            }}
                        >
                            <ChannelEntry
                                key={channel.id}
                                channel={channel}
                                banned={bannedChannels.has(channel.id)}
                                muted={mutedChannels.has(channel.id)}
                                unreadMessages={0}  // todo: return this value with the backend
                                onClick={() => {
                                    if (bannedChannels.has(channel.id)) {
                                        return;
                                    }
                                    setSelectedIndex(index);
                                    channelChanged(channel);
                                }}
                                isSelected={selectedIndex === index}
                            />
                        </li>
                    ))}
                </ul>
            </Container>
        );
    }

    return <></>
};

export default ChatChannelBrowser;