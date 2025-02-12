// pages/api/test.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ result: 'Hello World!' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
