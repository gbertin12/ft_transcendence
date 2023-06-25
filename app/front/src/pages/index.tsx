import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Grid } from '@nextui-org/react'
import SignIn from '@/components/auth/SignIn'
import SignUp from '@/components/auth/SignUp'

const inter = Inter({ subsets: ['latin'] })

function closeHandler() {}

export default function Home() {

    return (
        <>
            <Head>
                <title> Transcendance </title>
            </Head>

            <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
                <Grid.Container justify='center' gap={4} >
                    <Grid>
                        <SignIn closeModal={closeHandler} />
                    </Grid>
                    <Grid>
                        <SignUp />
                    </Grid>
                </Grid.Container>
            </main>
        </>
    );
}
