import LayoutAuth from "@/components/layout-authenticated";
import useSWR from 'swr';

async function fetcher(url: string) {
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res?.ok) {
        throw 'big problem';
    }
    return await res.json();
}

export default function Profile() {
    const { data, error } = useSWR('http://localhost:3000/user/me', fetcher);

    if (error) window.location = '/login';
    if (!data) return <div>loading...</div>

    return (
        <LayoutAuth>
            <h2>User Profile</h2>
            <img src={`http://localhost:3000/static/avatars/${data.avatar}`}/>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </LayoutAuth>
    )
}
