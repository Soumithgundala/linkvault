import { db } from '@/firebase'; // Ensure your Firebase instance is correctly imported
import { doc, setDoc } from 'firebase/firestore';

/**
 * Saves user profiles to Firestore.
 * @param userId - The ID of the authenticated user.
 * @param profiles - An array of social profiles to save.
 */
export const addUserProfile = async (userId: string, profiles: { platform: string; username: string }[]) => {
  const userDocRef = doc(db, 'users', userId); // Reference to the user's document
  await setDoc(userDocRef, { profiles }, { merge: true }); // Save profiles to Firestore
};