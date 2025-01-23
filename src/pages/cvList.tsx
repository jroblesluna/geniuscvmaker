import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from '@firebase/firestore';
import SvgStatusWriting from '../components/svgStatusWriting';
import SvgStatusFinalized from '../components/svgStatusFinalized';
import htmlDocx from 'html-docx-js/dist/html-docx';

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

function cvList({ auth }) {
  const { user } = auth;
  const [cvRequests, setCVRequests] = useState<CVRequest[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [showCV, setShowCV] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const firestore = getFirestore();
        const userRequestsCollection = collection(
          firestore,
          'users/' + user.uid + '/cvRequests'
        );
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();

    const interval = setInterval(() => {
      fetchCVs();
    }, 15000); // Fetch every minute

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleViewCV = async (cvId: string) => {
    try {
      const firestore = getFirestore();
      const cvDocRef = doc(firestore, 'users', user.uid, 'cvRequests', cvId);
      const cvDoc = await getDoc(cvDocRef);
      if (cvDoc.exists()) {
        const geniusResponse = cvDoc.data().geniusResponse;
        setSelectedCV(geniusResponse);
        setShowCV(true);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
    }
  };

  const handleHideCV = () => {
    setShowCV(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      fetch('/assets/html/printTemplate.html')
        .then((response) => response.text())
        .then((data) => {
          const modifiedHTML = data.replace(
            '<div id="content"></div>',
            `<div id="content">${selectedCV || ''}</div>`
          );
          printWindow.document.write(modifiedHTML);
          printWindow.document.close();

          // Ensure the content is fully loaded before printing
          printWindow.onload = () => {
            printWindow.print();
          };
          // Close the print window after printing is completed
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        })
        .catch((error) => {
          console.error('Error loading print template:', error);
        });
    } else {
      console.error('Failed to open print window');
    }
  };

  const handleDownloadWord = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${selectedCV || ''}
      </body>
      </html>
    `;

    const converted = htmlDocx.asBlob(htmlContent);
    const url = URL.createObjectURL(converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 py-4 ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">My CV's</h1>
      </div>
      <div className={`flex w-full  ${isSmallScreen ? 'flex-col' : 'flex-row'} gap-4`}>
        <div className={`w-full `}>
          {isLoading ? (
            <div className="text-center flex flex-col items-center h-[50vh] justify-center  mx-auto  ">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>

              <p className="mt-2">Loading...</p>
            </div>
          ) : cvRequests.length === 0 ? (
            <div className="text-center flex flex-col items-center h-[50vh] justify-center  mx-auto  ">
              <img src="https://static.thenounproject.com/png/2902077-200.png" width={100} />
              <p className="mt-2">There are no CV Requests yet!</p>
            </div>
          ) : (
            <div className="flex flex-col w-full gap-4">
              {cvRequests
                .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                .map((cvRequest) => (
                  <div
                    key={cvRequest.id}
                    className="bg-gradient-to-tr from-blue-950 to-blue-300 rounded-md shadow-blue-950 shadow-md flex flex-row border gap-2"
                  >
                    <div>
                      {cvRequest.status === 'writing' ? (
                        <SvgStatusWriting />
                      ) : cvRequest.status === 'finalized' ? (
                        <SvgStatusFinalized />
                      ) : null}
                    </div>
                    <div className="flex flex-col w-full justify-center text-[#DDEBFF]">
                      <div>
                        <b>Date:</b> {cvRequest.createdAt.toDate().toLocaleString()}
                      </div>
                      <div>
                        <b>App:</b> {cvRequest.geniusApp}
                      </div>
                      <div>
                        {cvRequest.status === 'writing' ? (
                          <span>
                            <b>In Progress</b>
                          </span>
                        ) : cvRequest.status === 'finalized' ? (
                          <button
                            onClick={() => handleViewCV(cvRequest.id)}
                            className="appWhiteOnOrange text-sm text-gray-800 font-semibold py-2 px-2 border border-gray-400 hover:border-gray-800 rounded-lg"
                          >
                            View CV
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        {cvRequests.length !== 0 && (
          <div className={`${isSmallScreen ? 'w-full' : 'w-1/2'}`}>
            {showCV && selectedCV && (
              <div
                className={`${isSmallScreen ? '' : 'sticky top-0 max-h-screen overflow-auto'}`}
              >
                {isSmallScreen ? (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-2">
                    <div
                      className="bg-black bg-opacity-50 absolute inset-0"
                      onClick={handleHideCV}
                    ></div>
                    <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-full max-h-full overflow-auto">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={handlePrint}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Print
                        </button>
                        <button
                          onClick={handleDownloadWord}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Download as Word
                        </button>
                        <button
                          onClick={handleHideCV}
                          className="text-red-500 hover:text-red-700"
                        >
                          Close
                        </button>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: selectedCV }} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-xl shadow-lg">
                    <div className="sticky top-0 bg-blue-100 z-10 p-2 rounded-t-xl">
                      <div className="flex justify-between items-center text-xl px-2">
                        <button
                          onClick={handlePrint}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Print
                        </button>
                        <button
                          onClick={handleDownloadWord}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Download as Word
                        </button>
                        <button
                          onClick={handleHideCV}
                          className="text-red-500 hover:text-red-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="px-4" dangerouslySetInnerHTML={{ __html: selectedCV }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withProtected(cvList);
