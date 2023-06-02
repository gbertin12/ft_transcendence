import { Grid } from "@nextui-org/react";
import PlayerInfo from "@/components/profile/PlayerInfo";
import PlayerStats from "@/components/profile/PlayerStats";
import EditPlayerInfo from "@/components/profile/EditPlayerInfo";
import { useUser } from "@/contexts/user.context";

export default function Profile() {
    const { user } = useUser();

    return (
        <Grid.Container gap={2}>
            <Grid xs={4}>
                <PlayerInfo user={user}/>
            </Grid>

            <Grid xs={2}>
                <PlayerStats user={user}/>
            </Grid>

            <Grid xs={4}>
                <EditPlayerInfo/>
            </Grid>
        </Grid.Container>
    );
}
