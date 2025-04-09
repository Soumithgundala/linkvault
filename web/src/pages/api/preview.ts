// src/pages/api/preview.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  const apiKey = "ca958b4a1ac736fe002bf468987eb7a2"

  try {
    const response = await fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Preview fetch error:', err);
    res.status(500).json({ error: 'Preview fetch failed' });
  }
}
