import { NextApiRequest, NextApiResponse } from 'next';

export default function subscription_create(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log("======== Subscription_Creation ========");
        console.log("req", req);
        console.log("res", res);
    } catch (error) {
        res.status(500).json({ error: 'Error getting answer.', message: error.message });
    }
}