// // pages/api/search.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import admin from 'firebase-admin';
// import { getLinkPreview } from 'link-preview-js';

// // Initialize Firebase Admin SDK only once
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       // Replace escaped newlines with actual newlines
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// const db = admin.firestore();

// interface PlatformPattern {
//   name: string;
//   urlPattern: string;
//   usernameRegex: RegExp;
// }

// const platforms: PlatformPattern[] = [
//   {
//     name: 'Instagram',
//     urlPattern: 'https://instagram.com/{username}',
//     usernameRegex: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i,
//   },
//   {
//     name: 'Twitter',
//     urlPattern: 'https://x.com/{username}',
//     usernameRegex: /^[A-Za-z0-9_]{1,15}$/,
//   },
//   {
//     name: 'LinkedIn',
//     urlPattern: 'https://linkedin.com/in/{username}',
//     usernameRegex: /^[\w\-]{3,100}$/i,
//   },
//   {
//     name: 'GitHub',
//     urlPattern: 'https://github.com/{username}',
//     usernameRegex: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
//   },
//   {
//     name: 'Facebook',
//     urlPattern: 'https://facebook.com/{username}',
//     usernameRegex: /^[a-z\d.]{5,}$/i,
//   },
// ];

// function extractUsername(url: string): string | null {
//   try {
//     const urlObj = new URL(url);
//     const pathParts = urlObj.pathname.split('/').filter(Boolean);
//     return pathParts[pathParts.length - 1] || null;
//   } catch {
//     return null;
//   }
// }

// function generatePossibleUsernames(username: string): string[] {
//   const usernames = new Set<string>();
//   // Original username
//   usernames.add(username);
//   // Remove special characters
//   const cleaned = username.replace(/[^a-zA-Z0-9]/g, '');
//   usernames.add(cleaned);
//   // Convert to lowercase
//   usernames.add(username.toLowerCase());
//   // Remove dots
//   const noDots = username.replace(/\./g, '');
//   usernames.add(noDots);
//   return Array.from(usernames);
// }

// async function validateProfileUrl(url: string): Promise<{
//   valid: boolean;
//   title?: string;
//   description?: string;
//   image?: string;
// }> {
//   try {
//     const preview = await getLinkPreview(url);
//     return {
//       valid: true,
//       title: preview.title,
//       description: preview.description,
//       image: preview.images ? preview.images[0] : undefined,
//     };
//   } catch {
//     return { valid: false };
//   }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Set CORS headers (if your frontend is hosted on a different domain)
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
  
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { url } = req.query;
//     if (!url || typeof url !== 'string') {
//       throw new Error('URL parameter is required');
//     }

//     const username = extractUsername(url);
//     if (!username) {
//       throw new Error('Could not extract username from URL');
//     }

//     const possibleUsernames = generatePossibleUsernames(username);
//     const results: any[] = [];

//     // Query Firestore for profiles matching any of the possible username variations
//     // Note: Firestore 'in' queries support up to 10 values. Adjust your logic if needed.
//     const profilesSnapshot = await db.collection('profiles')
//       .where('username', 'in', possibleUsernames)
//       .get();

//     if (!profilesSnapshot.empty) {
//       profilesSnapshot.forEach(doc => {
//         results.push({
//           type: 'database',
//           confidence: 1,
//           profile: { id: doc.id, ...doc.data() },
//         });
//       });
//     }

//     // Check each platform for discovered profiles
//     const platformChecks = platforms.map(async (platform) => {
//       for (const possibleUsername of possibleUsernames) {
//         if (platform.usernameRegex.test(possibleUsername)) {
//           const profileUrl = platform.urlPattern.replace('{username}', possibleUsername);
//           const validation = await validateProfileUrl(profileUrl);
          
//           if (validation.valid) {
//             results.push({
//               type: 'discovered',
//               platform: platform.name,
//               username: possibleUsername,
//               url: profileUrl,
//               confidence: 0.8,
//               ...validation,
//             });
//           }
//         }
//       }
//     });

//     await Promise.all(platformChecks);

//     // Sort the results by confidence in descending order
//     results.sort((a, b) => b.confidence - a.confidence);

//     res.status(200).json(results);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message || 'Internal server error' });
//   }
// }
