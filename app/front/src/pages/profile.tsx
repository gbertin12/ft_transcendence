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
    const [ profile, setProfile ] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch( 'http://localhost:3000/user/me',
                { credentials: 'include' }
            );
            if (res?.ok) {
                const profile = await res.json();
                setProfile(profile);
            } else {
                window.location.href = '/login';
            }
        })();
    }, []);

    //if (error) window.location.href = '/login';
    if (!profile) return <div>loading...</div>

    return (
        <LayoutAuth>
            <h2>User Profile</h2>
            <img src={`http://localhost:3000/static/avatars/${profile.avatar}`}/>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
        </LayoutAuth>
    )
}
