import LayoutAuth from "@/components/layout-authenticated";
import useSWR from 'swr';

async function fetcher(url: string) {
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res?.ok) {
        throw 'big problem';
    }
    return await res.text();
}


export default function Profile({ profile }) {
    const { data, error } = useSWR('http://localhost:3000/auth/profile', fetcher);

    if (error) window.location = '/login';
    if (!data) return <div>loading...</div>

    return (
        <LayoutAuth>
            <h2>User Profile</h2>
            <pre>{data.toString()}</pre>
        </LayoutAuth>
    )
}
