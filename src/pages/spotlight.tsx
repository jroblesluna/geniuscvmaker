import { withProtected } from '../hook/route';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { collection, doc, getDoc, getDocs, getFirestore } from '@firebase/firestore';
import { goScratch, goCraft, goOptimize, goCVList } from '../utils/navigateRoutes';
import { ScrappingService } from '../service/ScrappingService';
import { capitalize, isValidURL } from '../utils/others';
import { CVRequest } from '../interfaces/geniuscvmaker';
import toast from 'react-hot-toast';

function Spotlight({ auth }) {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<string>('');
  const { user } = auth;
  const [cvRequests, setCVRequests] = useState<CVRequest[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState<boolean>(false);
  const [selectedFinalCV, setSelectedFinalCV] = useState<string>('');
  // Navigate between pages
  const [selectedStep, setSelectedStep] = useState<'choice' | 'requirements' | 'analysis'>(
    'choice'
  );
  const [prechoiceCV, setPreChoiceCV] = useState<string | null>(null);
  const [choiceCV, setChoiceCV] = useState<string | null>(null);
  const [showCV, setShowCV] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingAnalyze, setIsLoadingAnalyze] = useState<boolean>(true);
  const [resultsAnalyze, setResultsAnalyze] = useState<string>('');

  const handleScrape = async (url: string) => {
    try {
      const response = await ScrappingService(url);

      if (response) {
        setResults('```START OF REQUERIMENTS \n' + response + 'END OF REQUERIMENTS```\n');
      }
    } catch (error) {
      toast.error('Failed to fetch scraping data:');
      console.error('Failed to fetch scraping data:', error);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const generateAnalyze = async () => {
    setIsLoadingAnalyze(true);
    setSelectedStep('analysis');
    if (inputValue.trim() === '') {
      alert('Por favor, ingrese los requisitos del trabajo o el enlace de la vacante.');
    } else {
      if (isValidURL(inputValue)) {
        handleScrape(inputValue);
      } else {
        setResults('```START OF REQUERIMENTS \n' + inputValue + 'END OF REQUERIMENTS```\n');
      }
    }

    let geniusCommand =
      'Your task is to analyze a CV and do a Strengths and Weaknesses analysis following these steps:\n';
    geniusCommand +=
      'Step 1: Consider the CURRICULUM VITAE in html format, contained between triple quotes:\n';
    geniusCommand += '```START OF CURRICULUM VITAE\n';
    geniusCommand += selectedFinalCV;
    geniusCommand += 'END OF CURRICULUM VITAE```\n';
    geniusCommand +=
      'Step 2: Consider the following REQUIREMENTS as a series of attributes that the CV should have, contained between triple quotes: \n';
    geniusCommand += results;
    geniusCommand +=
      'Step 3: Conduct a strengths and weaknesses analysis that compares the CURRICULUM VITEA with the REQUIREMENTS requested in the job application., contained between triple quotes: \n';
    geniusCommand +=
      'Step 4: Adapt the response to be able to display in a <div>, consider bold, titles, subtitles \n';

    try {
      const response = await fetch('http://localhost:3000/api/generate-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ geniusPrompt: geniusCommand }),
      });

      const data = await response.json();
      if (data.result) {
        setResultsAnalyze(data.result);
        setIsLoadingAnalyze(false);
      } else {
        setIsLoadingAnalyze(false);
        console.error(data.error);
      }
    } catch (error) {
      console.log('Error analize cv');
    }
  };

  const generateCV = async (event) => {
    event.preventDefault();
    if (!resultsAnalyze || !selectedCV) {
      toast.error('Error: Data not found.');
    } else {
      setIsLoadingRequest(true);
      const response = await fetch('/api/geniuscvmaker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          geniusApp: 'spotlight',
          geniusBody: {
            cv: selectedCV,
            analysis: resultsAnalyze,
          },
          status: 'writing',
        }),
      });
      const data = await response.json();
      if (data.requestPath != undefined) {
        toast.success('You created a new CV Request: ' + data.requestPath.split('/').pop());
      } else {
        toast.error('Error creating CV request. Please contact Support.');
      }

      goCVList();
    }
  };

  const goNextStep = (step: 'choice' | 'requirements' | 'analysis') => {
    setSelectedStep(step);
  };

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
            // geniusBody: cvRequestData.geniusBody,
            status: cvRequestData.status,
          });
          // fetchedCVRequests.push({
          //   id: doc.id + '2',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
          // fetchedCVRequests.push({
          //   id: doc.id + '3',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
          // fetchedCVRequests.push({
          //   id: doc.id + '4',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
          // fetchedCVRequests.push({
          //   id: doc.id + '5',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
          // fetchedCVRequests.push({
          //   id: doc.id + '6',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
          // fetchedCVRequests.push({
          //   id: doc.id + '7',
          //   createdAt: cvRequestData.createdAt,
          //   geniusApp: cvRequestData.geniusApp,

          //   status: cvRequestData.status,
          // });
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
      setPreChoiceCV(cvId);
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

  const handleChoice = (idCV: string | null) => {
    setChoiceCV(idCV);
    setSelectedFinalCV(selectedCV || '');
    setShowCV(false);
  };
  const goBackSteps = (): void => {
    setSelectedStep((prevStep) => {
      if (prevStep === 'analysis') return 'requirements';
      if (prevStep === 'requirements') return 'choice';
      return 'choice';
    });
  };

  const goNextSteps = (): void => {
    if (
      ((choiceCV && choiceCV.length === 0) || choiceCV == null) &&
      selectedStep == 'choice'
    ) {
      return;
    }

    if ((inputValue.length == 0 && selectedStep == 'requirements') || results.length === 0) {
      return;
    }

    setSelectedStep((nextStep) => {
      if (nextStep === 'choice') return 'requirements';
      if (nextStep === 'requirements') return 'analysis';
      return 'analysis';
    });
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className=" flex items-center justify-center">
        <div className="text-4xl font-bold tracking-tigh mt-1">Spotlight</div>
      </div>
      <div className="flex flex-col items-center justify-center w-full relative">
        <div className="w-full rounded-2xl py-4 px-1 md:px-6 md:w-[95%]">
          <div className="space-y-2 text-center mb-4   mx-auto items-center justify-center  gap-3 flex flex-row w-fit ">
            <button
              className={
                'rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-105 hover:bg-gray-400 mt-1 ' +
                (selectedStep == 'choice'
                  ? ' cursor-default pointer-events-none opacity-0 '
                  : '')
              }
              onClick={selectedStep == 'choice' ? undefined : goBackSteps}
            >
              <ChevronLeft className="h-5 w-5 " />
            </button>
            <p className="text-lg text-gray-500  ">Create your perfect CV for your new job</p>
            <button
              className={
                'rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-105 hover:bg-gray-400 ' +
                ((choiceCV && choiceCV.length === 0) || choiceCV == null
                  ? '  cursor-default pointer-events-none opacity-0'
                  : ' ') +
                (selectedStep == 'analysis'
                  ? ' cursor-default pointer-events-none opacity-0'
                  : '')
              }
              onClick={goNextSteps}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {selectedStep == 'choice' && (
            <div className={`flex w-full  mx-auto  flex-col gap-4  `}>
              {!isLoading && cvRequests.length !== 0 && (
                <p className="font-semibold">
                  1. Choose one of your CVs as a reference for your application
                </p>
              )}

              <div className={`w-full  flex flex-col`}>
                {isLoading ? (
                  <div className="text-center flex flex-col items-center h-[50vh] justify-center  mx-auto  ">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>

                    <p className="mt-2">Loading...</p>
                  </div>
                ) : cvRequests.length === 0 ? (
                  <div className="text-center flex flex-col items-start h-[50vh] justify-start  mx-auto   gap-7  mt-10">
                    <p className="font-bold">
                      You don’t have a CV yet. We recommend using one of the following options
                      to get started.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3  min-h-[30vh] mx-auto ">
                      <div className="flex flex-col shadow border px-4 py-8 gap-2  justify-between">
                        <p> Create your first CV or Resume. </p>
                        <button
                          className="py-2 px-4 bg-[#FF4F22] hover:opacity-80 text-white rounded-lg font-bold"
                          onClick={goScratch}
                        >
                          Scratch
                        </button>
                      </div>
                      <div className="flex flex-col shadow border px-4 py-8 gap-2 justify-between">
                        <p>
                          Complete a CV with your skills, experience, and other relevant
                          information.
                        </p>
                        <button
                          className="py-2 px-4 bg-[#FF4F22] hover:opacity-80 text-white rounded-lg font-bold"
                          onClick={goCraft}
                        >
                          Craft
                        </button>
                      </div>
                      <div className="flex flex-col shadow border px-4 py-8 gap-2 justify-between">
                        <p>
                          Let’s review your current CV. Upload the DOC or PDF file you have!
                        </p>
                        <button
                          className="py-2 px-4 bg-[#FF4F22] hover:opacity-80 text-white rounded-lg font-bold"
                          onClick={goOptimize}
                        >
                          Optimize
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[53vh]  min-h-[35vh] ">
                    {cvRequests
                      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                      .filter((cvRequest) => cvRequest.status === 'finalized')
                      .map((cvRequest) => (
                        <div
                          key={cvRequest.id}
                          className={
                            'rounded-md shadow-md  border gap-2  duration-300 hover:shadow-lg p-3 h-fit ' +
                            (choiceCV == cvRequest.id ? 'bg-[#fffbf0]' : '')
                          }
                        >
                          <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-black/10 p-3 group-hover:bg-primary/20 transition-colors">
                              <FileCheck className="h-6 w-6 text-black" />
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
                                className="w-full  bg-[#FF4F22] hover:opacity-85 text-white text-sm font-semibold py-2 px-2  rounded-xl"
                              >
                                View CV
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <button
                  className={
                    ' w-full  sm:w-1/2  mt-4 mx-auto py-2  text-white font-semibold rounded-lg hover:opacity-75  ' +
                    ((choiceCV && choiceCV.length === 0) || choiceCV == null
                      ? ' hidden'
                      : 'bg-black')
                  }
                  onClick={() => goNextStep('requirements')}
                >
                  Continue
                </button>
              </div>

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

                          <button
                            onClick={() => handleChoice(prechoiceCV)}
                            className="text-white mt-2 hover:opacity-75 bg-blue-700 rounded-lg px-4 py-1 w-1/2 "
                          >
                            Choice
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedStep == 'requirements' && (
            <>
              <p className="font-semibold">
                2. Add reference requirements for your application
              </p>
              <div className="mb-4 mt-5">
                <textarea
                  className="w-full min-h-[300px] md:min-h-[200px] p-4 text-nowrap sm:text-wrap   border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder={
                    'Paste job requirements or vacancy link here...\n' +
                    'e.g. https://www.linkedin.com/jobs/view/123456'
                  }
                  value={inputValue}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button
                className={
                  'w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 ' +
                  (inputValue.length == 0
                    ? ' bg-gray-500 cursor-not-allowed pointer-events-none  hover:bg-gray-5000 '
                    : '')
                }
                onClick={generateAnalyze}
              >
                Go to analyze CV
              </button>
            </>
          )}

          {selectedStep == 'analysis' && (
            <>
              <p className="font-semibold">
                3. Review the analysis of strengths and weaknesses
              </p>
              {isLoadingAnalyze ? (
                <div className="text-center flex flex-col items-center h-[50vh] justify-center  mx-auto  ">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 mt-5">
                    <div className="max-h-[50vh] overflow-auto minh-[30vh]">
                      <div dangerouslySetInnerHTML={{ __html: resultsAnalyze }} />
                    </div>
                  </div>
                  <button
                    className={
                      'w-full py-3 mt-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 ' +
                      (isLoadingRequest
                        ? ' cursor-default pointer-events-none bg-gray-500'
                        : '')
                    }
                    disabled={isLoadingRequest}
                    onClick={generateCV}
                  >
                    Generate CV now!
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {/*Debug scrapping */}
      {results.length > 0 && (
        <div className="p-4">
          <div>
            <h2 className="font-semibold">Resultados Scraping:</h2>
            <p>{results}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default withProtected(Spotlight);
