import ChanneldGrid from "@/components/chat/grids/ChannelsGrid";
import FriendGrid from "@/components/chat/grids/FriendGrid";
import { useUser } from "@/contexts/user.context";
import { Grid, Loading } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            if (!user.id) {
                router.push(`/?next=${router.asPath}`);
            }
        }
    }, [router]);

    if (!user.id) return (<Loading/>);

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
