import { Grid, Loading, Row } from "@nextui-org/react";
import PlayerInfo from "@/components/profile/PlayerInfo";
import EditPlayerInfo from "@/components/profile/EditPlayerInfo";
import { useUser } from "@/contexts/user.context";
import MatchHistory from "@/components/profile/MatchHistory";
import { useState } from "react";
import EloChart from "@/components/profile/EloChart";

export default function Profile() {
    const { user } = useUser();
    const [ showEdit, setShowEdit ] = useState<boolean>(false);

    function handleShowEdit() {
        setShowEdit(!showEdit);
    }

    if (!user.id) return <Loading/>

    if (!showEdit) {
        return (
            <Grid.Container gap={2}>
                <Row justify='center'>
                    <Grid xs={4}>
                        <PlayerInfo user={user} handleShowEdit={handleShowEdit}/>
                    </Grid>

                    <Grid xs={4}>
                        <EloChart user={user}/>
                    </Grid>
                </Row>

                <Row justify='center'>
                    <Grid xs={8}>
                        <MatchHistory user={user}/>
                    </Grid>
                </Row>
            </Grid.Container>
        );
    } else {
        return (
            <Grid.Container gap={2}>
                <Row justify='center'>
                    <Grid xs={4}>
                        <EditPlayerInfo user={user} handleShowEdit={handleShowEdit}/>
                    </Grid>

                    <Grid xs={4}>
                        <EloChart user={user}/>
                    </Grid>
                </Row>

                <Row justify='center'>
                    <Grid xs={8}>
                        <MatchHistory user={user}/>
                    </Grid>
                </Row>
            </Grid.Container>
        );
    }
}
