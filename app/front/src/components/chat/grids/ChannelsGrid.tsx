import { Grid } from "@nextui-org/react";
import ChannelList from "../ChannelList";

const ChanneldGrid: React.FC<any> = () => {
    return (
        <Grid xs={3} direction="column">
            <ChannelList />
        </Grid>
    );
}

export default ChanneldGrid;