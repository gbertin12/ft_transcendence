import { useUser } from '@/contexts/user.context';
import { Avatar, Grid, Text } from '@nextui-org/react';
import React from 'react';

interface ChatMessageProps {
    content: string;
    senderId: number;
    ghost?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, senderId }) => {
    const { user } = useUser();
    const userId = user.id;

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
                        borderRadius: "$2xl",
                        padding: "$xs",
                        px: "$lg",
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