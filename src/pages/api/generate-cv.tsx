// pages/api/generate-cv.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  result?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    const content = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      res.status(500).json({ error: 'OpenAI API key is not configured' });
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a Human Resources Admissions Specialist. You can create impressive CVs for people.',
            },
            {
              role: 'user',
              content: content.geniusPrompt,
            },
          ],
          temperature: 0.6,
          max_tokens: 1500,
          top_p: 1.0,
          frequency_penalty:0.0,
          presence_penalty:0.0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        res.status(response.status).json({ error: error.message });
        return;
      }

      const data = await response.json();
      const result = data.choices[0].message.content.replace(/```html/g, '').replace(/```/g, '');

      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while generating the CV' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
