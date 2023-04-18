import Layout from '@/components/layout';
import Link from 'next/link';

export default function Home() {
    return (
        <Layout>
            <h1>Home</h1>
            <p><Link href="/login">login</Link></p>
        </Layout>
    )
}
