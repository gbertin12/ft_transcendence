import React from "react";

interface MessageProps {
    timestamp: Date;
    userId?: number;
    content: string;
}

const ChatMessage: React.FC<MessageProps> = ({ timestamp, userId, content }) => {
    return (
        <li className="grid my-3">
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
    )
};

export default ChatMessage;