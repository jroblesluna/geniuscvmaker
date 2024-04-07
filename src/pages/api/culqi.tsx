import { NextApiRequest, NextApiResponse } from 'next';

const culqiApiServerUrl = "https://api.culqi.com";

const culqiMethods = {
    "list.plans": {
        invokeMethod: "GET", invokeEndpoint: "/v2/recurrent/plans"
    },
    "list.cards": {
        invokeMethod: "GET", invokeEndpoint: "/v2/cards"
    },
    "create.customers": {
        invokeMethod: "POST", invokeEndpoint: "/v2/customers"
    },
    "create.cards": {
        invokeMethod: "POST", invokeEndpoint: "/v2/cards"
    }

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { culqiMethod, culqiBody } = req.body;
        const apiKey = process.env.CULQI_SECRET_API_KEY;
        const method = culqiMethods[culqiMethod]?.invokeMethod;

        const response = await fetch(culqiApiServerUrl + culqiMethods[culqiMethod]?.invokeEndpoint, {
            method: method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: (method == "GET") ? null : JSON.stringify(culqiBody),
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error getting list.' });
    }
}
