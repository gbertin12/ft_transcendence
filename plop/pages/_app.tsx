import '@/styles/globals.css'
import Layout from '../components/layout'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
	return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    )
}
//
// export default function MyApp({ Component, pageProps }) {
//   return (
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//   )
// }
