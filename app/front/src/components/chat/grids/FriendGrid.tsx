import { Grid } from "@nextui-org/react";
import FriendList from "../FriendList";

const FriendGrid: React.FC<any> = () => {
    return (
        <Grid xs={3} direction="column">
            <FriendList />
        </Grid>
    );
}

export default FriendGrid;