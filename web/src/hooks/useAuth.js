// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase'; // Your Firebase auth instance

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Sets user object if logged in, null if not
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user };
}