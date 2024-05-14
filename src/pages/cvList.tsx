import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import { Timestamp, collection, getDocs, getFirestore } from '@firebase/firestore';
import SvgStatusWriting from '../components/svgStatusWriting';

function cvList({ auth }) {
  interface CVRequest {
    id: string;
    createdAt: Timestamp;
    geniusApp: string;
    geniusBody: {
      activities: string;
      envision: string;
      experience: string;
      field_of_study: string;
      languages: string;
      motivation: string;
      passion: string;
      references: string;
      skills: string;
      studies: string;
    };
    status: string;
  }

  const { user} = auth;
  const [cvRequests, setCVRequests] = useState<CVRequest[]>([]);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const firestore = getFirestore();
        const userRequestsCollection = collection(firestore, "users/" + user.uid + "/cvRequests");
        const querySnapshot = await getDocs(userRequestsCollection);
        const fetchedCVRequests: CVRequest[] = [];
        querySnapshot.forEach((doc) => {
          const cvRequestData = doc.data() as CVRequest;
          fetchedCVRequests.push({
            id: doc.id,
            createdAt: cvRequestData.createdAt,
            geniusApp: cvRequestData.geniusApp,
            geniusBody: cvRequestData.geniusBody,
            status: cvRequestData.status,
          });
        });
        setCVRequests(fetchedCVRequests);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchCVs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 max-w-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">My CV's</h1>
      </div>
      {(cvRequests.length == 0) ?
        <>
          <div className='text-center'>
            There are no CV Requests yet!
          </div>
        </> :
        <div className='flex flex-col w-full gap-4'>
          {cvRequests
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
            .map((cvRequest) => (
              <div key={cvRequest.id} className='bg-gradient-to-tr from-blue-950 to-blue-300 rounded-md px-3 shadow-blue-950 shadow-md flex flex-row border gap-2'>
                <div ><SvgStatusWriting /></div>
                <div className='flex flex-col w-full justify-center text-[#DDEBFF]'>
                  <div><b>ID:</b> {cvRequest.id}</div>
                  <div><b>App:</b> {cvRequest.geniusApp}</div>
                  <div><b>Status:</b> {cvRequest.status}</div>
                </div>
                <div className='flex flex-col justify-center text-[#DDEBFF]'><b>Requested:</b> {cvRequest.createdAt.toDate().toLocaleString()}</div>
              </div>
            ))}
        </div>
      }

    </div>
  );
}

export default withProtected(cvList);
