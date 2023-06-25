import React, { FormEvent } from "react";
import { Button, FormElement, Input, Row, Spacer } from "@nextui-org/react";

export default function MFAInput(
    { code, setCode, btnCallback }: { code: string, setCode: (code: string) => void, btnCallback: () => void}
) {
    function handleInput(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setCode(target.value);
    }

    return (
        <Row justify="center">
            <Input
                bordered
                aria-label="2FA input"
                labelLeft="Code"
                onInput={handleInput}
                value={code}/>
            <Spacer x={1}/>
            <Button auto onPress={btnCallback}>Verify</Button>
        </Row>
    );
}
