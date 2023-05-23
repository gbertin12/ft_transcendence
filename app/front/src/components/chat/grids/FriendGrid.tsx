import { Grid } from "@nextui-org/react";
import FriendList from "../FriendList";
import { Friend } from "@/interfaces/chat.interfaces";

interface FriendGridProps {
    friends: Friend[];
}

const FriendGrid: React.FC<FriendGridProps> = ({ friends }) => {
    return (
        <Grid xs={3} direction="column">
            <FriendList friends={friends} />
        </Grid>
    );
}

export default FriendGrid;