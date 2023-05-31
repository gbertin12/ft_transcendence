import Head from 'next/head';
import Profile from '../components/profile/profile'

export default function ProfilePage() {
    return (
        <>
            <Head>
            <title> Profile </title>
            </Head>
            <Profile/>
        </>
    );
}
