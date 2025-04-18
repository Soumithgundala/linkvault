// import type { NextApiRequest, NextApiResponse } from 'next';
// import puppeteer from 'puppeteer';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { username } = req.query;

//   if (!username || typeof username !== 'string') {
//     return res.status(400).json({ error: 'Valid username is required' });
//   }

//   try {
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     const page = await browser.newPage();
    
//     // Spoof browser fingerprints
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-US,en;q=0.9',
//     });

//     await page.goto(`https://leetcode.com/${username}/`, {
//       waitUntil: 'networkidle2',
//       timeout: 30000
//     });

//     // Handle potential CAPTCHA
//     if ((await page.title()).includes('Access Denied')) {
//       await browser.close();
//       return res.status(429).json({ error: 'LeetCode anti-bot triggered' });
//     }

//     const data = await page.evaluate(() => ({
//       solved: document.querySelector('div.text-[24px].font-medium.text-label-1')?.textContent,
//       streak: document.querySelectorAll('div.text-[24px].font-medium.text-label-1')[1]?.textContent
//     }));

//     await browser.close();

//     if (!data.solved || !data.streak) {
//       return res.status(404).json({ error: 'Profile data not found' });
//     }

//     return res.status(200).json({
//       solved: parseInt(data.solved.replace(/,/g, '')),
//       streak: parseInt(data.streak.replace(/\D/g, ''))
//     });

//   } catch (error) {
//     console.error('LeetCode Scraping Error:', error);
//     return res.status(500).json({ 
//       error: error.message.includes('Timeout') 
//         ? 'Request timed out - try again later' 
//         : 'Failed to fetch LeetCode data'
//     });
//   }
// }