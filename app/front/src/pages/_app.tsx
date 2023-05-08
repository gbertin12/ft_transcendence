import '@/styles/globals.css'
import Layout from '../components/layout'
import type { AppProps } from 'next/app'
import { createTheme } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const lightTheme = createTheme({
	type: 'light',
	theme: {
		colors: {
			background: "#ECEDEE",
		}
	}
})

const darkTheme = createTheme({
	type: 'dark',
	theme: {
		colors: {
			background: "#0F0F0F",
		}
	}
})

import { NextUIProvider } from '@nextui-org/react';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<NextThemesProvider
			defaultTheme='system'
			attribute='class'
			value={{
				light: lightTheme.className,
				dark: darkTheme.className
			}}
		>
			<NextUIProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</NextUIProvider>
		</NextThemesProvider>
	);
}
