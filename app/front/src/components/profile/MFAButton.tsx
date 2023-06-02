import React, { FormEvent, useState } from "react";
import { Button, FormElement, Input, Modal, Row, Spacer, Text } from "@nextui-org/react";
import { useUser } from "@/contexts/user.context";
import { toDataURL } from 'qrcode';

export default function MFAButton() {
    const { user, setUser } = useUser();
    const [ otp, setOtp ] = useState<boolean>(user.otp);
    const [ showQrcode, setShowQrcode ] = useState<boolean>(false);
    const [ qrcodeUri, setQrcodeUri] = useState<string>("");
    const [ validated, setValidated ] = useState<boolean>(false);
    const [ code, setCode ] = useState<string>("");
    const [ error, setError ] = useState<string>("");

    async function enable2FA() {
        const res = await fetch("http://localhost:3000/auth/2fa/enable", {
            credentials: "include"
        });
        if (res?.ok) {
            const otpauth_uri = await res.text();
            const img_uri = await toDataURL(otpauth_uri);
            setQrcodeUri(img_uri);
            setShowQrcode(true);
        }
    }

    async function disable2FA() {
        await fetch("http://localhost:3000/auth/2fa/disable", {
            credentials: "include"
        });
        setUser({ ...user, otp: false });
        setOtp(false);
    }

    async function verify2FA() {
        const res = await fetch("http://localhost:3000/auth/2fa/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        if (res?.ok) {
            setValidated(true);
            setShowQrcode(false);
            setUser({ ...user, otp: true });
            setOtp(true);
        } else {
            const err = await res.json();
            setError(err.message);
        }
    }

    async function handleClose() {
        if (!validated) {
            disable2FA();
            setShowQrcode(false);
        }
    }

    function handleInput(event: FormEvent<FormElement>) {
        const target = event.target as HTMLInputElement;
        setCode(target.value);
    }

    if (showQrcode) {
        return (
            <Modal
                blur
                closeButton
                preventClose
                width="33%"
                aria-labelledby="2FA QR code"
                open={showQrcode}
                onClose={handleClose}>
                <Modal.Header>
                    <Text>Scan QR code with authenticator app</Text>
                </Modal.Header>

                <Modal.Body>
                    <img src={qrcodeUri}/>
                </Modal.Body>

                <Modal.Footer>
                    <Row justify="center">
                        <Text>Enter the 6 digit code for confirmation</Text>
                        <Text color="error">{error}</Text>
                    </Row>
                    <Row justify="center">
                        <Input
                            bordered
                            aria-label="2FA input"
                            labelLeft="Code"
                            onInput={handleInput}
                            value={code}/>
                        <Spacer x={1}/>
                        <Button auto onPress={verify2FA}>Verify</Button>
                    </Row>
                </Modal.Footer>
            </Modal>
        );
    } else if (otp) {
        return (
            <Button color="error" onPress={disable2FA}>Disable 2FA</Button>
        );
    } else {
        return (
            <Button color="error" onPress={enable2FA}>Enable 2FA</Button>
        );
    }
}
