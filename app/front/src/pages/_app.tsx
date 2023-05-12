import '@/styles/globals.css'
import Layout from '../components/layout'
import type { AppProps } from 'next/app'
import { createTheme } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const lightTheme = createTheme({
	type: 'light',
	theme: {
		colors: {
			backgroundAlpha: "#DFDFDF",
			background: "#ECEDEE",
			primary: "$black",
			primaryLightContrast: "$black"
		}
	}
})

const darkTheme = createTheme({
	type: 'dark',
	theme: {
		colors: {
			backgroundAlpha: "#121212",
			background: "#0F0F0F",
			primary: "#32BE32",
			primaryLightContrast: "#289828"
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
