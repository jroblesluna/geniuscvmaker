import "../styles/globals.css";
import "../config/firebase";
import { AuthProvider } from "../hook/auth";
import AuthStateChanged from "../layout/AuthStateChanged";
import { AppProps } from 'next/app';
import { NextUIProvider } from "@nextui-org/react";
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<link rel='icon' href='/assets/favicon.png' />
			</Head>
			<NextUIProvider>
				<AuthProvider>
					<AuthStateChanged>
						<Component {...pageProps} />
					</AuthStateChanged>
				</AuthProvider>
			</NextUIProvider>
		</>
	);
}

export default MyApp;
