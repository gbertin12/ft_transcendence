import { Text, Card, Col, Avatar, Button, Row, Spacer } from "@nextui-org/react";
import { User } from "@/interfaces/user.interface";
import PlayerStats from "@/components/profile/PlayerStats";
import { IconPencil } from '@tabler/icons-react';
import { useUser } from "@/contexts/user.context";

export default function PlayerInfo(
    { user, handleShowEdit }: { user: User, handleShowEdit: () => void }
) {
    const { user: me } = useUser();

    return (
        <Card>
            <Card.Header>
                <Row justify="space-between" align="center">
                    <Text h2>Player Info</Text>
                    {(me.id == user.id) && (
                        <Button
                        onPress={handleShowEdit}
                        iconRight={<IconPencil/>}
                        auto >
                        </Button>
                    )}
                </Row>
            </Card.Header>

            <Card.Divider/>

            <Card.Body>
                <Col align="center">
                    <Avatar
                        src={`http://bess-f1r2s10:3000/static/avatars/${user.avatar}`}
                        css={{ size: "$40" }}
                        alt="user picture"
                        bordered>
                    </Avatar>
                    <Spacer y={1}/>
                    <Text h2>{user.name}</Text>
                </Col>
                <hr/>
                <Col>
                    <PlayerStats user={user}/>
                </Col>
            </Card.Body>
        </Card>
    );
}
