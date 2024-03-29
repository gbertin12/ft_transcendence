import { Button, Text, Row, Card, Input, Spacer, FormElement } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';
import { FormEvent, useState } from "react";
import MFAButton from "./MFAButton";
import { User } from "@/interfaces/user.interface";

export default function EditPlayerInfo(
    { user, handleShowEdit }: { user: User, handleShowEdit: () => void }
) {
    const { setUser } = useUser();
    const [ name, setName ] = useState<string>("");
    const [ files, setFiles ] = useState<FileList|null>(null);
    const [ error, setError ] = useState<string>("");

    function handleOnInput(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setName(target.value);
    }

    function handleOnChange(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setFiles(target.files);
    }

    async function updateProfile() {
        const formData = new FormData();

        if (name) {
            formData.append("name", name);
        }
        if (files && files[0]) {
            formData.append("avatar", files[0]);
        }

        if (name || files) {
            const res = await fetch("http://paul-f4br5s1:3000/user/me", {
                credentials: "include",
                method: "POST",
                body: formData,
            });
            if (res?.ok) {
                const avatar = await res.text();
                if (name && avatar) {
                    setUser((prevuser) => {
                        prevuser.name = name;
                        prevuser.avatar = avatar;
                        return prevuser;
                    });
                } else if (name) {
                    setUser((prevuser) => {
                        prevuser.name = name;
                        return prevuser;
                    });
                } else {
                    setUser((prevuser) => {
                        prevuser.avatar = avatar;
                        return prevuser;
                    });
                }
                setError("");

                // go back to PlayerInfo component
                handleShowEdit();
            } else {
                const err = await res.json();
                if (typeof err.message === "string") {
                    setError(err.message);
                } else if (Array.isArray(err.message)) {
                    if (err.message[0].constraints && err.message[0].constraints.matches) {
                        setError("Error: Invalid username (only alphanumeric characters + '.' and '_' are allowed). Must be between 2 and 20 characters");
                    } else {
                        setError("Unknown error");
                    }
                } else {
                    setError("Unknown error");
                }
            }

            // reset input elements to default/none value
            setName("");
            const fileinput = document.querySelector<HTMLInputElement>("input[type='file']");
            if (fileinput) fileinput.value = "";
            setFiles(null);
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
                <Input aria-label="edit username" labelLeft="Username" value={name} onInput={handleOnInput}/>

                <Spacer y={2}/>

                <input type="file" onChange={handleOnChange}/>

                {(error) && (<>
                    <Spacer y={2}/>
                    <Text h4 color="error">{error}</Text>
                </>)}

                <Spacer y={1}/>

                <MFAButton/>
            </Card.Body>

            <Card.Divider/>

            <Card.Footer>
                <Row wrap="wrap" justify="space-evenly" align="center">
                    <Button bordered onPress={handleShowEdit}>Cancel</Button>
                    <Button onPress={updateProfile}>Update</Button>
                </Row>
            </Card.Footer>
        </Card>
    );
}
