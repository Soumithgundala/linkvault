import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  // Validate URL parameter
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Get API key from environment variables
  const apiKey = "ca958b4a1ac736fe002bf468987eb7a2";
  if (!apiKey) {
    console.error('Missing API key');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Validate and transform response
    const formattedData = {
      title: data.title?.trim() || parsedUrl.hostname,
      description: data.description?.trim() || '',
      image: data.image || '',
      url: data.url || url
    };

    // Cache for 1 day (client-side cache)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json(formattedData);
  } catch (err) {
    console.error('Preview fetch error:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch preview',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}