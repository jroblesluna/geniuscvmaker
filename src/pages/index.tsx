import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router
import { withPublic } from '../hook/route';

function Index({ auth }) {
  const router = useRouter(); // Initialize Next.js router

  const [backgroundIndex, setBackgroundIndex] = useState(0);

  const backgrounds = [
    '/assets/images/background_home.jpg',
    '/assets/images/background_home_2.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function goApps() {
    router.push('/apps');
  }
  function goSubscriptions() {
    router.push('/subscriptions');
  }
  function goSupport() {
    router.push('/support');
  }

  return (
    <>
      <div className="snap-y snap-mandatory h-screen w-screen overflow-scroll">
        <div className="snap-start relative h-screen overflow:hidden">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center sm:origin-right md:origin-bottom lg:origin-bottom xl:origin-bottom-right opacity-[95%]"
            style={{
              backgroundImage: `url(${backgrounds[backgroundIndex]})`,
              transition: 'background-image 1s ease',
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center sm:items-center md:items-start lg:items-start xl:items-start sm:ml-0 md:ml-10 lg:ml-12 xl:ml-14 mt-3 sm:mt-3 md:mt-10 lg:mt-16 xl:mt-24">
              <div className="p-2 rounded-lg relative">
                <div className="black-text text-[15vw] sm:text-[15vw] md:text-[9vw] lg:text-[9vw] xl:text-[9vw]">
                  genius
                </div>
                <div className="subtitle-text absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-3/4 text-[5vw] sm:text-[5vw] md:text-[3vw] lg:text-[3vw] xl:text-[3vw]">
                  CV MAKER
                </div>
              </div>
              <div
                className="topic-title-citrine ml-4 text-[5vw] sm:text-[5vw] md:text-[3vw] lg:text-[3vw] xl:text-[3vw] text-shadow shadow-gray-900"
                style={{ lineHeight: '1' }}
              >
                Empower your career with
                <br />
                AI-Driven Resumes
              </div>
              <div
                className="topic-text-white ml-4 text-[3vw] sm:text-[3vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-shadow shadow-gray-900 mt-2"
                style={{ lineHeight: '1' }}
              >
                Create professional resumes effortlessly with
                <br />
                our AI-powered platform. Get started today!
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="appButtonContainer">
                  <button
                    onClick={goApps}
                    className="appButton w-full text-[3vw] sm:text-[3vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded-lg"
                  >
                    START BUILDING
                  </button>
                </div>
                {/* 
                                <div className="appButtonContainer">
                                    <button onClick={goSupport} className="appButton w-full text-[3vw] sm:text-[3vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded-lg">CONTACT US</button>
                                </div>
                                */}
              </div>
            </div>
          </div>
        </div>
        <div className="snap-start relative h-screen overflow:hidden bg-stone-100">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center sm:origin-right md:origin-bottom lg:origin-bottom xl:origin-bottom-right">
            <div className="absolute inset-0 flex flex-col justify-center items-center sm:items-center md:items-start lg:items-start xl:items-start mx-3 sm:mx-3 md:mx-10 lg:mx-16 xl:mx-24 mt-3 sm:mt-3 md:mt-[3vw] lg:mt-16 xl:mt-24">
              <div className="relative">
                <div className="blue-text text-[6vw]" style={{ lineHeight: 1 }}>
                  key features
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 px-2 mx-5">
                <div>
                  <div className="topic-title-citrine text-[5vw] sm:text-[3vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] mt-5 text-shadow shadow-gray-300">
                    AI-Powered Templates
                  </div>
                  <div
                    className="topic-text-darkgray text-[5vw] sm:text-[2.5vw] md:text-[2.5vw] lg:text-[2.5vw] xl:text-[2vw] mt-1"
                    style={{ lineHeight: 1.2 }}
                  >
                    Choose from a variety of professionally designed templates tailored to your
                    industry.
                  </div>
                </div>
                <div>
                  <div className="topic-title-darkgray text-[5vw] sm:text-[3vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] mt-5 text-shadow shadow-gray-300">
                    Personalized Suggestions
                  </div>
                  <div
                    className="topic-text-darkgray text-[5vw] sm:text-[2.5vw] md:text-[2.5vw] lg:text-[2.5vw] xl:text-[2vw] mt-1"
                    style={{ lineHeight: 1.2 }}
                  >
                    Receive intelligent suggestions to enhance your resume and stand out from
                    the crowd.
                  </div>
                </div>
                <div>
                  <div className="topic-title-orange text-[5vw] sm:text-[3vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] mt-5 text-shadow shadow-gray-300">
                    Easy Editing Tools
                  </div>
                  <div
                    className="topic-text-darkgray text-[5vw] sm:text-[2.5vw] md:text-[2.5vw] lg:text-[2.5vw] xl:text-[2vw] mt-1"
                    style={{ lineHeight: 1.2 }}
                  >
                    Edit and customize your resume with ease using our intuitive editing tools.
                  </div>
                </div>
              </div>
              <div className="appButtonContainer flex  w-full items-center justify-center">
                <button
                  onClick={goApps}
                  className="appButton text-[3vw] sm:text-[3vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded"
                >
                  START TODAY
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="snap-start relative h-screen overflow:hidden bg-gray-400 ">
          <div className="h-full flex flex-col justify-center items-center">
            <div className="grid mx-5 py-5 sm:py-15 md:py-15 lg:py-18 xl:py-20">
              <div className="col-start-1 row-start-1 flex-col justify-start items-start ml-0 absolute pr-10 sm:pr-0  sm:pt-8  w-full">
                <div
                  className="  orange-text text-[6vw] sm:text-[6vw] md:text-[6vw] lg:text-[6vw] xl:text-[6vw] text-center sm:text-left px-2"
                  style={{ lineHeight: '1.2' }}
                >
                  Testimonials
                </div>
              </div>
              <div className="col-start-1 row-start-1 flex-col justify-start items-center p-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mt-5 ">
                  <div>
                    <div className="mx-[12vw] sm:mx-[8vw] sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 ">
                      <img src="/assets/images/testimony_1.png" />
                    </div>
                    <div className="mt-0">
                      "Thanks to Genius CV Maker, I landed my dream job! The resume templates
                      are top-notch."
                    </div>
                    <div className="mt-0 font-bold">John Doe, Senior Software Engineer</div>
                  </div>
                  <div>
                    <div className="mx-[12vw] sm:mx-[8vw] ">
                      <img src="/assets/images/testimony_2.png" />
                    </div>
                    <div className="mt-0">
                      "I'm amazed by how easy it was to create a professional resume with your
                      CV Maker platform. Highly recommended!"
                    </div>
                    <div className="mt-0 font-bold">Jane Smith, Marketing Specialist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="snap-start relative h-screen overflow:hidden bg-gray-900">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center sm:origin-right md:origin-bottom lg:origin-bottom xl:origin-bottom-right">
            <div className="absolute inset-0 flex flex-col justify-center items-center sm:items-start md:items-start lg:items-start xl:items-start mx-10">
              <div className="relative">
                <div className="white-text text-[4.5vw]" style={{ lineHeight: '1.2' }}>
                  Package Options
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 mx-5 mt-5 gap-2 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
                  <div>
                    <div className="topic-title-white mt-5 text-[5vw]">Starter</div>
                    <div className="topic-text-white mt-1 text-[5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      $14.99{' '}
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      100 TOKENS
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      Expires: 1 month
                    </div>
                  </div>
                  <div className="appButtonContainer flex justify-right w-full justify-center sm:justify-start items-center">
                    <button
                      onClick={goSubscriptions}
                      className="appButton text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded"
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
                  <div>
                    <div className="flex items-center topic-title-white">
                      <div className="topic-title-white mt-5 text-[5vw]">Pro</div>
                      <div className="flex items-center">
                        <span className="border rounded mt-4 ml-3 p-1">POPULAR</span>
                      </div>
                    </div>
                    <div className="topic-text-white mt-1 text-[5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      $54.99
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      400 TOKENS
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      Expires: 4 months
                    </div>
                  </div>
                  <div className="appButtonContainer flex justify-right w-full justify-center  sm:justify-start items-center">
                    <button
                      onClick={goSubscriptions}
                      className="appButton text-[3vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded"
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 ">
                  <div>
                    <div className="topic-title-white mt-5 text-[5vw]">Premium</div>
                    <div className="topic-text-white mt-1 text-[5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      $149.99
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      1200 TOKENS
                    </div>
                    <div className="topic-text-white mt-1 text-[4.5vw] sm:text-[2.5vw] md:text-[3vw] lg:text-[2vw] xl:text-[2vw] font-bold">
                      Exp in: 12 months
                    </div>
                  </div>
                  <div className="appButtonContainer flex justify-right w-full justify-center  sm:justify-start items-center ">
                    <button
                      onClick={goSubscriptions}
                      className="appButton text-[3vw]  sm:text-[2.5vw] md:text-[2vw] lg:text-[2vw] xl:text-[2vw] text-gray-800 font-semibold py-2 px-4 border border-gray-400 hover:border-gray-800 rounded"
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withPublic(Index);
