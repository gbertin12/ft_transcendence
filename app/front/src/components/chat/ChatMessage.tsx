import { Avatar, Grid, Text } from '@nextui-org/react';
import React from 'react';

interface ChatMessageProps {
    content: string;
    senderId: number;
    userId: number;
    ghost?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, senderId, userId }) => {
    return (
        <Grid.Container>
            <Grid xs={1}>
                {senderId !== userId &&
                    <Avatar />
                }
            </Grid>
            <Grid xs={11} css={{ w: "stretch" }} justify={senderId === userId ? "flex-end" : "flex-start"}>
                <Text
                    span
                    css={{
                        backgroundColor: senderId === userId ? "$success" : "$gray200",
                        textAlign: senderId === userId ? "right" : "left",
                        borderRadius: "$2xl",
                        padding: "$xs",
                        color: senderId === userId ? "$white" : "default",
                    }}
                >
                    {content}
                </Text>
            </Grid>
        </Grid.Container>
    );
};

export default ChatMessage;