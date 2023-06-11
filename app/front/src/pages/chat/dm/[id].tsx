import { useRouter } from "next/router";
import ChatLayout from "../layout";
import { Channel } from "@/interfaces/chat.interfaces";
import { useChat } from "@/contexts/chat.context";
import ChatBox from "@/components/chat/ChatBox";

const ChannelChat: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const { channels } = useChat();

    // Convert string to number
    const channelId: number = typeof id === "string" ? parseInt(id) : -1;
    const channel: Channel | undefined = channels.find((channel) => channel.id === channelId);

    if (!channel) {
        return (
            <ChatLayout>
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-3xl font-bold">404</h1>
                    <p className="text-xl">Could not find the channel you are looking for.</p>
                </div>
            </ChatLayout>
        );
    }
    return (
        <ChatLayout>
            <ChatBox channel={channel} />
        </ChatLayout>
    );
}

export default ChannelChat;