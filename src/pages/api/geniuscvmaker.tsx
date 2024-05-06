import { addDoc, collection, doc, getDoc, getFirestore, serverTimestamp } from '@firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const firestore = getFirestore();
        const userDocRef = doc(firestore, "users", req.body.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
            const cvRequestsCollectionRef = collection(userDocRef, 'cvRequests');
            let newRequest = {
                createdAt: serverTimestamp(),
                geniusApp: req.body.geniusApp,
                geniusBody: req.body.geniusBody
            }
            let requestDoc = await addDoc(cvRequestsCollectionRef, newRequest);
            res.status(200).json({ requestPath: requestDoc.path });
        } else {
            res.status(500).json({ error: 'Error getting user.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error getting answer.', message: error.message });
    }
}
