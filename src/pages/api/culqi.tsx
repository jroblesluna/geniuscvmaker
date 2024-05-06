import { NextApiRequest, NextApiResponse } from 'next';

const culqiApiServerUrl = "https://api.culqi.com";

enum KeyType { public, private }
const culqiMethods = {
    //CUSTOMERS
    "create.customers":
        { invokeMethod: "POST", invokeEndpoint: "/v2/customers", apiKeyType: KeyType.private, },
    "list.customers":
        { invokeMethod: "GET", invokeEndpoint: "/v2/customers", apiKeyType: KeyType.private, },
    "get.customers":
        { invokeMethod: "GET", invokeEndpoint: "/v2/customers/{id}", apiKeyType: KeyType.private, },
    "delete.customers":
        { invokeMethod: "DELETE", invokeEndpoint: "/v2/customers/{id}", apiKeyType: KeyType.private, },
    //TOKENS
    "create.tokens":
        { invokeMethod: "POST", invokeEndpoint: "/v2/tokens", apiKeyType: KeyType.public, },
    //CARDS
    "create.cards":
        { invokeMethod: "POST", invokeEndpoint: "/v2/cards", apiKeyType: KeyType.private, },
    "list.cards":
        { invokeMethod: "GET", invokeEndpoint: "/v2/cards", apiKeyType: KeyType.private, },
    "delete.cards":
        { invokeMethod: "DELETE", invokeEndpoint: "/v2/cards/{id}", apiKeyType: KeyType.private, },
    //PLANS
    "list.plans":
        { invokeMethod: "GET", invokeEndpoint: "/v2/recurrent/plans", apiKeyType: KeyType.private, },
    //SUBSCRIPTIONS
    "create.subscriptions":
        { invokeMethod: "POST", invokeEndpoint: "/v2/recurrent/subscriptions/create", apiKeyType: KeyType.private, },
    "list.subscriptions":
        { invokeMethod: "GET", invokeEndpoint: "/v2/recurrent/subscriptions", apiKeyType: KeyType.private, },
    "get.subscriptions":
        { invokeMethod: "GET", invokeEndpoint: "/v2/recurrent/subscriptions/{id}", apiKeyType: KeyType.private, },
    "delete.subscriptions":
        { invokeMethod: "DELETE", invokeEndpoint: "/v2/recurrent/subscriptions/{id}", apiKeyType: KeyType.private, },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { culqiMethod, culqiBody } = req.body;
        const method = culqiMethods[culqiMethod]?.invokeMethod;
        const apiKey = culqiMethods[culqiMethod]?.apiKeyType === KeyType.private
            ? process.env.CULQI_SECRET_API_KEY
            : process.env.CULQI_PUBLIC_API_KEY;

        console.log("INVOKING API");
        console.log("culqiMethod", culqiMethod);
        console.log("culqiBody", culqiBody);
        console.log("apiKey", apiKey);
        console.log("method", method);

        let url = culqiApiServerUrl + culqiMethods[culqiMethod]?.invokeEndpoint;

        // Buscar y reemplazar variables en el invokeEndpoint si es necesario
        const matches = url.match(/\{(\w+)\}/g);
        if (matches) {
            matches.forEach(match => {
                const variableName = match.slice(1, -1); // Eliminar los corchetes
                const variableValue = culqiBody[variableName];
                if (variableValue) {
                    url = url.replace(match, variableValue);
                } else {
                    throw new Error(`Variable ${variableName} not found in the request body.`);
                }
            });
        }

        if (method === "GET") {
            const queryParams = new URLSearchParams(culqiBody).toString();
            url += '?' + queryParams;
        }

        const response = await fetch(url, {
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
        res.status(500).json({ error: 'Error getting answer.', message: error.message });
    }
}
