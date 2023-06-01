import React, { useState } from "react";
import { Button, Modal, Text } from "@nextui-org/react";
import { useUser } from "@/contexts/user.context";
import { toDataURL } from 'qrcode';

export default function MFAButton() {
    const { user, setUser } = useUser();
    const [ otp, setOtp ] = useState<boolean>(user.otp);
    const [ showQrcode, setShowQrcode ] = useState<boolean>(false);
    const [ qrcodeUri, setQrcodeUri] = useState<string>("");

    async function enable2FA() {
        const res = await fetch("http://localhost:3000/auth/2fa/enable", {
            credentials: "include"
        });
        if (res?.ok) {
            const otpauth_uri = await res.text();
            const img_uri = await toDataURL(otpauth_uri);
            setQrcodeUri(img_uri);
            setShowQrcode(true);
            setUser({ ...user, otp: true });
            setOtp(true);
        }
    }

    async function disable2FA() {
        const res = await fetch("http://localhost:3000/auth/2fa/disable", {
            credentials: "include"
        });
        if (res?.ok) {
            setUser({ ...user, otp: false });
            setOtp(false);
        }
    }

    if (showQrcode) {
        return (
            <Modal
                blur
                closeButton
                preventClose
                width="25%"
                aria-labelledby="2FA QRCode"
                open={showQrcode}
                onClose={() => setShowQrcode(false)}>
                <Modal.Header>
                    <Text>Scan QR code with app</Text>
                </Modal.Header>

                <Modal.Body>
                    <img src={qrcodeUri}/>
                </Modal.Body>
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
