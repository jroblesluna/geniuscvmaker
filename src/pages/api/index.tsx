import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ error: 'Culqi Protected path.' });
}
