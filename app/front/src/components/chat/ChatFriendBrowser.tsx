import { Avatar, Container } from "@nextui-org/react";
import React from "react";
import ChatEntry from "./ChatEntry";

// FIXME: Connect to socket / database, demo data currently

const ChatFriendBrowser: React.FC = () => {
    return (
        <Container css={{p: 0}}>
            <ChatEntry
                name="Default Online User"
                userId={0}
                isOnline={true}
                isTyping={false}
                isPlaying={false}
                unreadMessages={0}
                key={0}
            />
            <ChatEntry
                name="Default Offline User"
                userId={0}
                isOnline={false}
                isTyping={false}
                isPlaying={false}
                unreadMessages={0}
                key={0}
            />
            <ChatEntry
                name="Default Playing User"
                userId={0}
                isOnline={true}
                isTyping={false}
                isPlaying={true}
                unreadMessages={0}
                key={0}
            />
            <ChatEntry
                name="Typing Online User"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={0}
                key={0}
            />
            <ChatEntry
                name="Typing Playing User"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={true}
                unreadMessages={0}
                key={0}
            />
            <ChatEntry
                name="Default Online User (Unread)"
                userId={0}
                isOnline={true}
                isTyping={false}
                isPlaying={false}
                unreadMessages={1}
                key={0}
            />
            <ChatEntry
                name="Default Offline User (Unread)"
                userId={0}
                isOnline={false}
                isTyping={false}
                isPlaying={false}
                unreadMessages={1}
                key={0}
            />
            <ChatEntry
                name="Spamming User (Unread 9+)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={12}
                key={0}
            />
            <ChatEntry
                name="Spamming User (Unread 9)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={9}
                key={0}
            />
            <ChatEntry
                name="Spamming User / Playing (Unread)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={true}
                unreadMessages={9}
                key={0}
            />
        </Container>
    );
};

export default ChatFriendBrowser;