import { Grid } from "@nextui-org/react";
import PlayerInfo from "./PlayerInfo";
import PlayerStats from "./PlayerStats";
import EditPlayerInfo from "./EditPlayerInfo";

export default function Profile() {

    return (
        <Grid.Container gap={2}>
            <Grid xs={4}>
                <PlayerInfo></PlayerInfo>
            </Grid>

            <Grid xs={2}>
                <PlayerStats/>
            </Grid>
            <Grid xs={4}>
                <EditPlayerInfo/>
            </Grid>
        </Grid.Container>
    );
}
