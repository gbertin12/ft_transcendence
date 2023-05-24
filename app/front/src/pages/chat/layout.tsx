import ChanneldGrid from "@/components/chat/grids/ChannelsGrid";
import FriendGrid from "@/components/chat/grids/FriendGrid";
import { Grid } from "@nextui-org/react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <Grid.Container css={{ "mx": "$4" }}>
            <ChanneldGrid />
            <Grid xs={6} direction="column">
                {children}
            </Grid>
            <FriendGrid />
        </Grid.Container>
    );
}