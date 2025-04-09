// src/lib/db.ts
import { getFirestore, doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import app from '@/firebase';

export interface SocialProfile {
  platform: string; // e.g., 'twitter', 'github', etc.
  username: string; // e.g., 'user123'
}

const db = getFirestore(app);

export const addUserProfile = async (userId: string, profiles: SocialProfile[]) => {
  const userRef = doc(db, 'users', userId);
  
  await setDoc(userRef, 
    {
      socialProfiles: arrayUnion(...profiles),
      updatedAt: new Date()
    },
    { merge: true } // Merge with existing data
  );
};

export const getUserProfiles = async (userId: string): Promise<SocialProfile[]> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data().socialProfiles : [];
};