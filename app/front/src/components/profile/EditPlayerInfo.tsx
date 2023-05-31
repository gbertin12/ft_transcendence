import { Button, Text, Row, Card, Input, Spacer, FormElement } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';
import { FormEvent, useState } from "react";

export default function EditPlayerInfo() {
    const { user, setUser } = useUser();
    const [ name, setName ] = useState<string>("");
    const [ files, setFiles ] = useState<FileList|null>();

    function handleOnInput(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setName(target.value);
    }

    function handleOnChange(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setFiles(target.files);
    }

    async function updateProfile() {
        if (name) {
            await fetch("http://localhost:3000/user/me", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
        }
        if (files) {
            const formData = new FormData();
            formData.append("avatar", files[0])
            await fetch("http://localhost:3000/user/avatar", {
                method: "POST",
                credentials: "include",
                body: formData
            });
        }

        const res = await fetch("http://localhost:3000/user/me", {
            credentials: "include"
        });
        const profile = await res.json();
        setUser(profile)
        setName("");
        setFiles(null);
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
                <input type="file" onChange={handleOnChange}/>
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
