import React, { useState } from "react";
import { Button, Modal, Row, Text } from "@nextui-org/react";
import { useUser } from "@/contexts/user.context";
import { toDataURL } from 'qrcode';
import MFAInput from "@/components/auth/MFAInput";

export default function MFAButton() {
    const { user, setUser } = useUser();
    const [ otp, setOtp ] = useState<boolean>(user.otp);
    const [ showQrcode, setShowQrcode ] = useState<boolean>(false);
    const [ qrcodeUri, setQrcodeUri] = useState<string>("");
    const [ validated, setValidated ] = useState<boolean>(false);
    const [ code, setCode ] = useState<string>("");
    const [ error, setError ] = useState<string>("");
    const [ showInput, setShowInput ] = useState<boolean>(false);

    async function verify2FA() {
        const res = await fetch("http://bess-f1r2s5:3000/auth/2fa/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });

        return res;
    }

    async function enable2FA() {
        const res = await fetch("http://bess-f1r2s5:3000/auth/2fa/enable", {
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
        await fetch("http://bess-f1r2s5:3000/auth/2fa/disable", {
            credentials: "include"
        });
        setUser({ ...user, otp: false });
        setOtp(false);
    }

    async function handleDisable2FA() {
        const res = await verify2FA();
        if (res?.ok) {
            disable2FA();
            setValidated(true);
            setShowInput(false);
            setCode("");
        }
    }

    async function handleVerify2FA() {
        const res = await verify2FA();
        if (res?.ok) {
            setValidated(true);
            setShowQrcode(false);
            setUser({ ...user, otp: true });
            setOtp(true);
            setCode("");
        } else {
            const err = await res.json();
            setError(err.message);
        }
    }

    async function handleCloseQrcode() {
        if (!validated) {
            disable2FA();
            setShowQrcode(false);
        }
    }

    async function handleCloseInput() {
        if (validated) {
            setShowInput(false);
        }
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
                onClose={handleCloseQrcode}>
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
                        <MFAInput code={code} setCode={setCode} btnCallback={handleVerify2FA}/>
                    </Row>
                </Modal.Footer>
            </Modal>
        );
    } else if (showInput) {
        return (
            <Modal
                blur
                closeButton
                preventClose
                width="25%"
                aria-labelledby="2FA Input"
                open={showInput}
                onClose={handleCloseInput}>
                <Modal.Header>
                    <Text>Enter 6 digit code to disable 2FA</Text>
                </Modal.Header>

                <Modal.Body>
                    <MFAInput code={code} setCode={setCode} btnCallback={handleDisable2FA}/>
                </Modal.Body>
            </Modal>
        );
    } else if (otp) {
        return (
            <Button color="error" onPress={() => setShowInput(true)}>Disable 2FA</Button>
        );
    } else {
        return (
            <Button color="error" onPress={enable2FA}>Enable 2FA</Button>
        );
    }
}
