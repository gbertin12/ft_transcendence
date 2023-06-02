import { Grid, Loading } from "@nextui-org/react";
import PlayerInfo from "@/components/profile/PlayerInfo";
import PlayerStats from "@/components/profile/PlayerStats";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/user.interface";

export default function Profile() {
    const router = useRouter();
    const [ user, setUser ] = useState<User>({} as User);

    useEffect(() => {
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
    }, []);

    if (!user) return <Loading/>

    return (
        <Grid.Container gap={2}>
            <Grid xs={4}>
                <PlayerInfo user={user}/>
            </Grid>

            <Grid xs={2}>
                <PlayerStats user={user}/>
            </Grid>
        </Grid.Container>
    );
}
