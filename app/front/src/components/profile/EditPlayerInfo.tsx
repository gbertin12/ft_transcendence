import { Button, Text, Row, Card, Input, Spacer, FormElement } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';
import { FormEvent, useState } from "react";

export default function EditPlayerInfo() {
    const { user, setUser } = useUser();
    const [ name, setName ] = useState<string>("");

    function handleOnInput(event: FormEvent<FormElement>) {
        let target = event.target as HTMLInputElement;
        setName(target.value);
    }

    async function updateProfile() {
        if (name) {
            const res = await fetch("http://localhost:3000/user/me", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ name })
            });
            if (res?.ok) {
                setUser({ ...user, name });
            }
        }
    }

    return (
        <Card>
            <Card.Header>
                <Row wrap="wrap" justify="space-between" align="center">
                    <Text h2>Edit Player Info</Text>
                </Row>
            </Card.Header>

            <Card.Divider/>

            <Card.Body>
                <Input labelLeft="Username" value={name} onInput={handleOnInput}/>
                <Spacer y={2}/>
                <input type="file"/>
            </Card.Body>

            <Card.Divider/>

            <Card.Footer>
                <Row wrap="wrap" justify="space-evenly" align="center">
                    <Button bordered>Cancel</Button>
                    <Button onPress={updateProfile}>Update</Button>
                </Row>
            </Card.Footer>
        </Card>
    );
}
