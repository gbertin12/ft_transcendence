import { Avatar, Badge, Container, Grid, Text } from "@nextui-org/react";
import React from "react";

const ChatEntry: React.FC = () => {
    return (
        <Grid.Container>
            <Grid css={{w: "stretch"}}>
                <Badge
                    content=""
                    placement="bottom-right"
                    color="success" // gray by default
                    variant="dot"   // set to 'points' when typing
                >
                    <Avatar
                        size="lg"
                    />
                </Badge>
                <Text span css={{ml: 12}}>name</Text>
                {/* TODO: Add a red badge when a message is unread */}
            </Grid>
        </Grid.Container >
    );
};

export default ChatEntry;