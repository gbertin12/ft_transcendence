import { Grid, Loading, Row } from "@nextui-org/react";
import PlayerInfo from "@/components/profile/PlayerInfo";
import PlayerStats from "@/components/profile/PlayerStats";
import MatchHistory from "@/components/profile/MatchHistory";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/user.interface";

function handleShowEdit() {}

export default function Profile() {
    const router = useRouter();
    const [ user, setUser ] = useState<User>({} as User);

    useEffect(() => {
        if (router.query.username) {
            (async () => {
                const res = await fetch(
                    `http://localhost:3000/user/profile/${router.query.username}`
                );
                if (res?.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    console.log("404 error");
                }
            })();
        }
    }, [router.isReady, router.query.username]);

    if (!user.id || !router.isReady) return <Loading/>

    return (
        <Grid.Container gap={2}>
            <Row justify='center'>
                <Grid xs={4}>
                    <PlayerInfo user={user} handleShowEdit={handleShowEdit}/>
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
