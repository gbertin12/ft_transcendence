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
        const res = await fetch("http://paul-f4br5s1:3000/auth/2fa/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp: code }),
        });

        return res;
    }

    async function enable2FA() {
        const res = await fetch("http://paul-f4br5s1:3000/auth/2fa/enable", {
            credentials: "include",
        });
        if (res?.ok) {
            const otpauth_uri = await res.text();
            const img_uri = await toDataURL(otpauth_uri);
            setQrcodeUri(img_uri);
            setShowQrcode(true);
        }
    }

    async function disable2FA() {
        const res = await fetch("http://paul-f4br5s1:3000/auth/2fa/disable", {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp: code }),
        });

        return res;
    }

    async function handleDisable2FA() {
        const res = await disable2FA();
        if (res?.ok) {
            setUser({ ...user, otp: false });
            setOtp(false);
            setValidated(true);
            setShowInput(false);
            setCode("");
            setError("");
        } else {
            setError("Invalid OTP");
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
            setError("");
        } else {
            setError("Invalid OTP");
            setCode("");
        }
    }

    async function handleCloseQrcode() {
        setShowQrcode(false);
        setOtp(false);
        setCode("");
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
                width="33%"
                aria-labelledby="2FA Input"
                open={showInput}
                onClose={handleCloseInput}>
                <Modal.Header>
                    <Text>Enter 6 digit code to disable 2FA</Text>
                </Modal.Header>

                <Modal.Body>
                    <Text color="error">{error}</Text>
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
