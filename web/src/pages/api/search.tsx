import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Firebase Admin Initialization (no changes here)
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error);
}

// Interfaces (no changes here)
interface UserDocument {
  userDisplayName: string;
}
interface SearchResult {
  platform: string;
  username: string;
  url: string;
  source: 'database';
  confidence: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') { /* ... CORS handling ... */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    return res.status(200).end();
  }

  try {
    if (!admin.apps.length) {
      throw new Error("Firebase has not been initialized.");
    }

    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query "q" is required.' });
    }

    const searchTerm = q.trim().toLowerCase();
    if (!searchTerm) {
        return res.status(200).json([]);
    }
      
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
      .where('searchableUsernames', 'array-contains', searchTerm)
      .limit(10)
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json([]);
    }

    const results: SearchResult[] = usersSnapshot.docs.map(doc => {
      const userData = doc.data() as UserDocument;
      return {
        platform: 'LinkVault Profile',
        username: userData.userDisplayName,
        // *** THIS IS THE ONLY CHANGE: The URL no longer has '/view' ***
        url: `/${encodeURIComponent(userData.userDisplayName)}`,
        source: 'database',
        confidence: 1.0,
      };
    });

    res.status(200).json(results);

  } catch (error: unknown) {
    console.error('Search API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    res.status(500).json({ error: errorMessage });
  }
}