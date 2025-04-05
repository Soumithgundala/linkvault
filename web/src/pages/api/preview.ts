// src/pages/api/preview.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  const apiKey = process.env.LINK_PREVIEW_API_KEY;

  try {
    const response = await fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Preview fetch error:', err);
    res.status(500).json({ error: 'Preview fetch failed' });
  }
}
