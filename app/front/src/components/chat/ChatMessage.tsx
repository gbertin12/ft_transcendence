import React from "react";

interface MessageProps {
    timestamp: Date;
    userId?: number;
    content: string;
    isGhost?: boolean;
}

const ChatMessage: React.FC<MessageProps> = ({ timestamp, userId, content, isGhost }) => {
    if (isGhost) {
        return (
            <li className="grid my-3 hover:bg-gray-100 p-2">
                {/* <img
                    className="w-12 h-12 rounded-full"
                    src=""
                /> */}
                {/* TODO: fix rendering */}
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div>
                    <p className="text-gray-500 text-sm">
                        {new Date(timestamp).toLocaleString()}
                    </p>
                    <p className="text-gray-400 opacity-95">{content}</p>
                </div>
            </li>
        );
    }
    return (
        <li className="grid my-3 hover:bg-gray-100 p-2">
            {/* <img
                className="w-12 h-12 rounded-full"
                src=""
            /> */}
            {/* TODO: fix rendering */}
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div>
                <p className="text-gray-500 text-sm">
                    {new Date(timestamp).toLocaleString()}
                </p>
                <p>{content}</p>
            </div>
        </li>
    );
};

export default ChatMessage;