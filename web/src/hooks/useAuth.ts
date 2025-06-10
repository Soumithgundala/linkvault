import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase'; // Your initialized Firebase instance

/**
 * A custom hook to provide the current user and authentication loading state.
 * @returns An object containing the user and a boolean loading state.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If a user is found, set the user state, otherwise set to null
      setUser(user);
      // Once the check is complete, set loading to false
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return { user, loading };
}