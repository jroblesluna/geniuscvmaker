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

import htmlDocx from 'html-docx-js/dist/html-docx';
import { FileCheck, FileLineChartIcon } from 'lucide-react';
import { capitalize } from '../utils/others';
import { CVRequest } from '../interfaces/geniuscvmaker';

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
        <div className={`w-full  flex flex-col`}>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[65vh]  min-h-[35vh] ">
              {cvRequests
                .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                .map((cvRequest) => (
                  <div
                    key={cvRequest.id}
                    className={
                      'rounded-md shadow-md  border gap-2  duration-300 hover:shadow-lg p-3 h-fit '
                    }
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="rounded-full bg-black/10 p-3  transition-colors relative overflow-hidden">
                          {cvRequest.status !== 'finalized' ? (
                            <FileLineChartIcon className="h-6 w-6 text-black" />
                          ) : (
                            <FileCheck className="h-6 w-6 text-black" />
                          )}
                          {cvRequest.status !== 'finalized' && (
                            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-black"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={'flex flex-col w-full justify-center'}>
                      <div className="space-y-2 text-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Date:</span>{' '}
                          {cvRequest.createdAt.toDate().toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">App:</span>
                          {' ' + capitalize(cvRequest.geniusApp)}
                        </div>
                      </div>

                      <div className=" mt-1.5">
                        <button
                          onClick={() => handleViewCV(cvRequest.id)}
                          className={
                            'w-full  bg-[#FF4F22] hover:opacity-85 text-white text-sm font-semibold py-2 px-2  rounded-xl ' +
                            (cvRequest.status !== 'finalized'
                              ? ' bg-gray-500 cursor-not-allowed pointer-events-none  hover:bg-gray-5000 '
                              : '')
                          }
                          disabled={cvRequest.status !== 'finalized'}
                        >
                          View CV
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {cvRequests.length !== 0 && (
                <div className={`${isSmallScreen ? 'w-1/2' : 'w-1/2'}`}>
                  {showCV && selectedCV && (
                    <div
                      className={`${
                        isSmallScreen ? '' : '  sticky top-0 max-h-screen  overflow-auto  '
                      }`}
                    >
                      <div className="fixed inset-0 flex items-center justify-center z-100 p-2 ">
                        <div
                          className="bg-black bg-opacity-50 absolute inset-0"
                          onClick={handleHideCV}
                        ></div>
                        <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-full sm:max-w-[50vw] max-h-[86vh] mt-16  flex flex-col items-center ">
                          <div className="flex justify-between items-center mb-4 w-full">
                            <div className="w-full flex  justify-end ">
                              <button
                                onClick={handleHideCV}
                                className="text-white hover:opacity-75 font-bold bg-red-600 px-3 py-1 rounded-3xl"
                              >
                                X
                              </button>
                            </div>
                          </div>
                          <div className="overflow-auto max-h-[80vh]">
                            <div dangerouslySetInnerHTML={{ __html: selectedCV }} />
                            <div dangerouslySetInnerHTML={{ __html: selectedCV }} />
                          </div>
                          <div className="flex flex-row gap-5 w-full">
                            {' '}
                            <button
                              onClick={handleDownloadWord}
                              className="text-white mt-2 hover:opacity-75 bg-blue-700 rounded-lg px-4 py-1 w-1/2 "
                            >
                              Download
                            </button>
                            <button
                              onClick={handlePrint}
                              className="text-white mt-2 hover:opacity-75 bg-gray-700 rounded-lg px-4 py-1 w-1/2"
                            >
                              Print
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withProtected(cvList);
