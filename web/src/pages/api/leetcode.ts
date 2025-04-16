// src/pages/api/leetcode.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Valid username is required' });
  }

  try {
    const { data } = await axios.get(`https://leetcode.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://leetcode.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // New selectors based on current LeetCode layout
    const solvedElement = $('div.flex.items-start.justify-between.gap-4 div:contains("Solved")').first();
    const streakElement = $('div.items-start.gap-2:has(svg[aria-label="streak"]) div.text-xl.font-medium');

    // Validate elements exist
    if (!solvedElement.length || !streakElement.length) {
      if ($('div:contains("User does not exist")').length > 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      throw new Error('Element not found - page structure may have changed');
    }

    // Extract and clean values
    const solvedText = solvedElement.text().replace('Solved', '').replace(/,/g, '').trim();
    const streakText = streakElement.text().replace(/\D/g, '').trim();

    // Final validation
    if (!solvedText || !streakText) {
      return res.status(404).json({ error: 'Profile data not found' });
    }

    // Handle CAPTCHA challenges
    if ($('title').text().includes('Access Denied')) {
      return res.status(429).json({ error: 'LeetCode rate limit exceeded - try again later' });
    }

    return res.status(200).json({
      solved: parseInt(solvedText),
      streak: parseInt(streakText)
    });
    
  } catch (error) {
    console.error('LeetCode API Error:', error.message);
    
    const statusCode = error.response?.status || 
                      error.message.includes('rate limit') ? 429 : 
                      500;

    return res.status(statusCode).json({
      error: statusCode === 404 ? 'Profile not found' :
             statusCode === 429 ? 'Too many requests - try again later' :
             'Failed to fetch LeetCode stats'
    });
  }
}