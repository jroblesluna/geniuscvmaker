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
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                telephoneNumber: req.body.telephoneNumber,
                about: req.body.about,
                facebook:req.body.facebook,
                instagram:req.body.instagram,
                linkedin:req.body.linkedin,
                tiktok:req.body.tiktok,
                youtube:req.body.youtube,
                github:req.body.github,
                geniusApp: req.body.geniusApp,
                geniusBody: req.body.geniusBody,
                status: req.body.status,
            }
            let requestDoc = await addDoc(cvRequestsCollectionRef, newRequest);
            console.log("PATH", requestDoc.path);

            const tasksCollectionRef = collection(firestore, 'tasks');
            const newTask = {
                requestPath: requestDoc.path,
                status: 0,
            };

            await addDoc(tasksCollectionRef, newTask);

            res.status(200).json({ requestPath: requestDoc.path });
        } else {
            res.status(500).json({ error: 'Error getting user.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error getting answer.', message: error.message });
    }
}
