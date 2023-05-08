import LayoutAuth from '@/components/layout-authenticated';
import { useState, useEffect } from 'react';
//import useSWR from 'swr';

/*async function fetcher(url: string): Promise<any> {
    // credentials: 'include' <-- needed to send the cookie to the backend
    const res = await fetch(url, { credentials: 'include' });
    if (!res?.ok) {
        throw 'unauthenticated';
    }
    return await res.json();
}*/

export default function Profile(): JSX.Element {
    //const { data, error } = useSWR('http://localhost:3000/user/me', fetcher);
    const [ name, setName ] = useState<string>('');
    const [ avatar, setAvatar ] = useState<string>('');

    useEffect(() => {
        (async () => {
            const res = await fetch( 'http://localhost:3000/user/me',
                { credentials: 'include' }
            );
            if (res?.ok) {
                const profile = await res.json();
                setName(profile.name);
                setAvatar(profile.avatar);
            } else {
                window.location.href = '/login';
            }
        })();
    }, []);

    //if (error) window.location.href = '/login';
    if (!name) return <div>loading...</div>

    return (
        <LayoutAuth>
            <h2>User Profile</h2>
            <img src={`http://localhost:3000/static/avatars/${avatar}`}/>
            <pre>{name}</pre>
        </LayoutAuth>
    )
}
