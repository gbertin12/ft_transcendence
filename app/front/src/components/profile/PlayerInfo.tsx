import { Text, Card, Image, Col } from "@nextui-org/react";
import { User } from "@/interfaces/user.interface";

export default function PlayerInfo({ user }: { user: User }) {

    return (
        <Card>
            <Card.Header>
                <Text h2>Player Info</Text>
            </Card.Header>

            <Card.Divider/>

            <Card.Body>
                <Col align="center">
                    <Image
                        src={`http://localhost:3000/static/avatars/${user.avatar}`}
                        width="50%"
                        height="auto"
                        alt="user picture"
                        showSkeleton>
                    </Image>
                    <Text h4>{user.name}</Text>
                </Col>
            </Card.Body>
        </Card>
    );
}
