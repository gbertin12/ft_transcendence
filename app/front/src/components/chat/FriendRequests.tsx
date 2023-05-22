import { Badge, Text } from "@nextui-org/react";

interface FriendRequestsProps {
    socket: Socket;
}

const FriendRequests: React.FC = () => {
    return (
        <>
            <Text h3>Friend requests</Text>
            <hr />
        </>
    );
}

export default FriendRequests;