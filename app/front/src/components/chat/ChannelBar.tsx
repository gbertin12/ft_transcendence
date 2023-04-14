import React from "react";

interface ChannelBarProps {
    title: string;
    topic: string;
    isPrivateMessage?: boolean;
    // messages: any[]; // -- TODO
}

const ChannelBar: React.FC<ChannelBarProps> = ({title, topic, isPrivateMessage}) => {
    return (
        <div className="pl-4 bg-blue-900 flex gap-x-1 w-full h-12 text-white">
            <h1 className="my-auto text-2xl">{isPrivateMessage ? "@" : "#"}</h1>
            <h2 className="my-auto text-2xl">{title}</h2>
            {!isPrivateMessage && <h3 className="my-auto text-gray-100 text-lg">{topic?.length > 100 ? topic?.slice(0, 100) + "..." : topic}</h3>}
        </div>
    );
};

export default ChannelBar;