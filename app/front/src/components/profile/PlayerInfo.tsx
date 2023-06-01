import { Button, Text, Row, Card, Image, Col } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';
import MFAButton from "./MFAButton";

export default function PlayerInfo() {
    const { user } = useUser();

    return (
        <Card>
            <Card.Header>
                <Row wrap="wrap" justify="space-between" align="center">
                    <Text h2>Player Info</Text>
                    <Button>edit</Button>
                </Row>
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
                    <MFAButton/>
                </Col>
            </Card.Body>
        </Card>
    );
}
