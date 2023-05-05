import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
	<>
    <Head>
	  <title> Transcendance </title>
    </Head>
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
    Home page
    </main>
	</>
  )
}
