// pages/_app.tsx
import type {AppProps} from 'next/app';
import '../styles/globals.css';
import '../styles/accounts.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;