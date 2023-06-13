import LayoutAuth from '@/components/layout-authenticated';
import { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';

export default function Mfa() {
    const [ uri, setUri ] = useState('');

    useEffect(() => {
        (async () => {
            const res = await fetch(
                'http://bess-f1r2s10:3000/auth/2fa/activate',
                { credentials: 'include' }
            );
            if (res?.ok) {
                const otpauth_uri = await res.text();
                const img_uri = await toDataURL(otpauth_uri);
                setUri(img_uri);
            }
        })();
    }, []);

    if (uri === '') return <div>loading...</div>

    return (
        <LayoutAuth>
            <h2>Multi Factor Authentication Setup</h2>
            <img src={uri}/>
        </LayoutAuth>
    )
}
