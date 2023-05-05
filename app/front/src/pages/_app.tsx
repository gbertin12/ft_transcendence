<<<<<<< HEAD
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createTheme } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const lightTheme = createTheme({
	type: 'light',
})

const darkTheme = createTheme({
	type: 'dark',
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
				<Component {...pageProps} />
			</NextUIProvider>
		</NextThemesProvider>
	);
=======
//import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Component {...pageProps} />
    )
>>>>>>> auth
}
