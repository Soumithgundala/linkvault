// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { getLinkPreview } from 'link-preview-js';
import { SocialProfile } from '@/lib/db';

// Initialize Firebase Admin SDK (keep your existing initialization)

interface PlatformPattern {
  name: string;
  urlPattern: string;
  usernameRegex: RegExp;
  domain: string;
}

const platforms: PlatformPattern[] = [
  {
    name: 'Instagram',
    domain: 'instagram.com',
    urlPattern: 'https://instagram.com/{username}',
    usernameRegex: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i,
  },
  {
    name: 'Twitter',
    domain: 'twitter.com',
    urlPattern: 'https://twitter.com/{username}',
    usernameRegex: /^[A-Za-z0-9_]{1,15}$/,
  },
  // Add other platforms...
];

interface SearchResult {
  platform: string;
  username: string;
  url: string;
  source: 'database' | 'discovered';
  confidence: number;
  title?: string;
  description?: string;
  image?: string;
}

// Add utility functions
function extractUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').filter(Boolean).pop() || null;
  } catch {
    return null;
  }
}

function generatePossibleUsernames(username: string): string[] {
  const variations = new Set<string>([
    username,
    username.replace(/[^a-zA-Z0-9]/g, ''),
    username.toLowerCase(),
    username.replace(/\./g, ''),
  ]);
  return Array.from(variations);
}

async function validateProfileUrl(url: string) {
  try {
    const preview = await getLinkPreview(url);
    return {
      valid: true,
      ...preview,
      image: 'images' in preview ? preview.images?.[0] : undefined,
    };
  } catch {
    return { valid: false };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      throw new Error('URL parameter is required');
    }

    const parsedUrl = new URL(url);
    const currentPlatform = platforms.find(p => parsedUrl.hostname.includes(p.domain));
    const username = extractUsername(url);

    if (!currentPlatform || !username) {
      throw new Error('Could not identify platform or username from URL');
    }

    const results: SearchResult[] = [];
    const db = admin.firestore();

    // Search for matching social profiles
    const profilesSnapshot = await db.collection('profiles')
      .where('socialLinks', 'array-contains', {
        platform: currentPlatform.name,
        username: username
      })
      .get();

    if (!profilesSnapshot.empty) {
      profilesSnapshot.forEach(doc => {
        const profile = doc.data() as { socialLinks: SocialProfile[] };
        profile.socialLinks.forEach(link => {
          if (link.platform !== currentPlatform.name) {
            const platformConfig = platforms.find(p => p.name === link.platform);
            results.push({
              platform: link.platform,
              username: link.username,
              url: platformConfig?.urlPattern.replace('{username}', link.username) || '',
              source: 'database',
              confidence: 1
            });
          }
        });
      });
    } else {
      const possibleUsernames = generatePossibleUsernames(username);

      // Search for similar usernames in profiles
      const similarProfiles = await db.collection('profiles')
        .where('username', 'in', possibleUsernames.slice(0, 10)) // Firestore limit
        .get();

      similarProfiles.forEach(doc => {
        results.push({
          platform: 'Profile',
          username: doc.data().username,
          url: `/profile/${doc.data().username}`,
          source: 'database',
          confidence: 0.7
        });
      });

      // Check other platforms
      const platformChecks = platforms.map(async (platform) => {
        if (platform.name === currentPlatform.name) return;

        for (const possibleUsername of possibleUsernames) {
          if (platform.usernameRegex.test(possibleUsername)) {
            const profileUrl = platform.urlPattern.replace('{username}', possibleUsername);
            const validation = await validateProfileUrl(profileUrl);
            
            if (validation.valid) {
              results.push({
                platform: platform.name,
                username: possibleUsername,
                url: profileUrl,
                source: 'discovered',
                confidence: 0.8,
                title: 'title' in validation ? validation.title : undefined,
                description: 'description' in validation ? validation.description : undefined,
                image: 'image' in validation ? validation.image: undefined
              });
            }
          }
        }
      });

      await Promise.all(platformChecks);
    }

    results.sort((a, b) => b.confidence - a.confidence);
    res.status(200).json(results);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
}