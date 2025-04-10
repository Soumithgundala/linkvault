// src/pages/api/preview.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  try {
    // Validate URL format
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const apiKey = "ca958b4a1ac736fe002bf468987eb7a2";

  try {
    const response = await fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Standardize response format
    const formattedData = {
      title: data.title || '',
      description: data.description || '',
      image: data.image || '',
      url: data.url || url
    };

    // Cache preview for 1 day
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(formattedData);
  } catch (err) {
    console.error('Preview fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch preview',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}