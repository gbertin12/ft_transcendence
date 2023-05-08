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
                key={1}
            />
            <ChatEntry
                name="Default Playing User"
                userId={0}
                isOnline={true}
                isTyping={false}
                isPlaying={true}
                unreadMessages={0}
                key={2}
            />
            <ChatEntry
                name="Typing Online User"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={0}
                key={3}
            />
            <ChatEntry
                name="Typing Playing User"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={true}
                unreadMessages={0}
                key={4}
            />
            <ChatEntry
                name="Default Online User (Unread)"
                userId={0}
                isOnline={true}
                isTyping={false}
                isPlaying={false}
                unreadMessages={1}
                key={5}
            />
            <ChatEntry
                name="Default Offline User (Unread)"
                userId={0}
                isOnline={false}
                isTyping={false}
                isPlaying={false}
                unreadMessages={1}
                key={6}
            />
            <ChatEntry
                name="Spamming User (Unread 9+)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={12}
                key={7}
            />
            <ChatEntry
                name="Spamming User (Unread 9)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={false}
                unreadMessages={9}
                key={8}
            />
            <ChatEntry
                name="Spamming User / Playing (Unread)"
                userId={0}
                isOnline={true}
                isTyping={true}
                isPlaying={true}
                unreadMessages={9}
                key={9}
            />
        </Container>
    );
};

export default ChatFriendBrowser;