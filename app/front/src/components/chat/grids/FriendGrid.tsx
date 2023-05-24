import { Grid } from "@nextui-org/react";
import FriendList from "../FriendList";
import { Friend } from "@/interfaces/chat.interfaces";


const FriendGrid: React.FC<any> = () => {
    return (
        <Grid xs={3} direction="column">
            <FriendList />
        </Grid>
    );
}

export default FriendGrid;