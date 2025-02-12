import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from '@firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const firestore = getFirestore();
    const userDocRef = doc(firestore, 'users', req.body.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    let newRequest;
    if (userDocSnapshot.exists()) {
      const cvRequestsCollectionRef = collection(userDocRef, 'cvRequests');
      if (req.body.geniusApp === 'optimize') {
        newRequest = {
          createdAt: serverTimestamp(),
          geniusBody: {
            url_cv: req.body.geniusBody.url_cv,
          },
          geniusApp: req.body.geniusApp,
          status: req.body.status,
        };
      } else if (req.body.geniusApp === 'spotlight') {
        newRequest = {
          createdAt: serverTimestamp(),
          geniusBody: {
            cv: req.body.geniusBody.cv,
            analysis: req.body.geniusBody.analysis,
          },
          geniusApp: req.body.geniusApp,
          status: req.body.status,
        };
      } else if (req.body.geniusApp === 'scratch') {
        newRequest = {
          createdAt: serverTimestamp(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          telephoneNumber: req.body.telephoneNumber,
          about: req.body.about,
          facebook: req.body.facebook,
          instagram: req.body.instagram,
          linkedin: req.body.linkedin,
          tiktok: req.body.tiktok,
          youtube: req.body.youtube,
          github: req.body.github,
          geniusApp: req.body.geniusApp,
          geniusBody: req.body.geniusBody,
          status: req.body.status,
        };
      } else {
        newRequest = {
          createdAt: serverTimestamp(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          telephoneNumber: req.body.telephoneNumber,
          about: req.body.about,
          facebook: req.body.facebook,
          instagram: req.body.instagram,
          linkedin: req.body.linkedin,
          tiktok: req.body.tiktok,
          youtube: req.body.youtube,
          github: req.body.github,
          geniusApp: req.body.geniusApp,
          geniusBody: req.body.geniusBody,
          status: req.body.status,
        };
      }

      let requestDoc = await addDoc(cvRequestsCollectionRef, newRequest);
      console.log('PATH', requestDoc.path);

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
    console.log(error.message);
    res.status(500).json({ error: 'Error getting answer.', message: error.message });
  }
}
