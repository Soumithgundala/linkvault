// pages/_app.tsx
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/firebase';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/accounts.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Update loading state
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Component {...pageProps} user={user} />;
}

export default MyApp;