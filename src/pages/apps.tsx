import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router
import { withProtected, withPublic } from '../hook/route';
import { goScratch, goCraft, goOptimize, goSpotlight } from '../utils/navigateRoutes';
function Apps({ auth }) {
  const router = useRouter(); // Initialize Next.js router

  const { logout } = auth;

  return (
    <>
      <div className="h-screen sm:h-[80vh] flex flex-col gap-4 justify-start  items-center mt-[2vw] ">
        <div
          className="flex flex-col items-center blue-text text-6xl"
          style={{ lineHeight: 1.4 }}
        >
          genius
        </div>
        <div className="flex flex-col items-center subtitle-text text-2xl -mt-8">CV MAKER</div>
        <div className="pb-5  mt-5 grid grid-cols-1   sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-2 md:gap-4 lg:gap-4 xl:gap-4">
          <div className="group min-w-[70vw] min-h-[70vw] sm:min-w-[35vw] sm:min-h-[35vw] md:min-w-[35vw] md:min-h-[35vw] lg:min-w-[23vw] lg:min-h-[23vw] xl:min-w-[23vw] xl:min-h-[23vw] w-[22vw] h-[22vw] [perspective:1000px]">
            <div className="relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ">
              <div className="absolute w-full h-full justify-center flex flex-col shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] rounded-xl [backface-visibility:hidden]">
                <div className="grid items-center ">
                  <div className="col-start-1 row-start-1 w-full">
                    <img className="rounded-xl w-full" src="/assets/images/scratch.jpg" />
                  </div>
                  <div className="col-start-1 row-start-1 black-text text-[5.25vw] sm:text-[3vw] mt-[5vw]">
                    Scratch
                  </div>
                </div>
              </div>
              <div className=" absolute w-full h-full flex flex-col justify-around  px-[5%] py-[5%] sm:px-[10%] sm:py-[5%] md:px-[10%] md:py-[5%] lg:px-[10%] lg:py-[5%] xl:px-[10%] xl:py-[5%] text-[2.5vw] sm:text-[1.25vw] md:text-[1.25vw] lg:text-[1.25vw] xl:text-[1.25vw] shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] bg-[#1b1f24] text-white rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <p className=" max-[300px]:text-[10px] max-[400px]:text-[11px]   max-sm:text-[14px]  max-[500px]:text-[16px]  max-[635px]:text-[18px]  max-md:text-[12px] max-lg:text-[14px]  ">
                  CREATE YOUR FIRST CV OR RÉSUMÉ. OUR AI HELPS YOU CREATE PROFESSIONAL CV BASED
                  ON YOUR INTERESTS AND PREFERENCES, EVEN IF YOU'RE SEEKING YOUR FIRST JOB.
                  IDEAL FOR YOUNG AND AMBITIOUS STUDENTS.
                </p>
                <button
                  onClick={goScratch}
                  className="appButton rounded-lg border border-white h-[5vw] sm:h-[3vw] md:h-[3vw] lg:h-[3vw] xl:h-[3vw]"
                >
                  Scratch
                </button>
              </div>
            </div>
          </div>
          <div className="group min-w-[70vw] min-h-[70vw] sm:min-w-[35vw] sm:min-h-[35vw] md:min-w-[35vw] md:min-h-[35vw] lg:min-w-[23vw] lg:min-h-[23vw] xl:min-w-[23vw] xl:min-h-[23vw] w-[22vw] h-[22vw] [perspective:1000px]">
            <div className="relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ">
              <div className="absolute w-full h-full justify-center flex flex-col shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] rounded-xl [backface-visibility:hidden]">
                <div className="grid items-center">
                  <div className="col-start-1 row-start-1  w-full">
                    <img className="rounded-xl  w-full" src="/assets/images/craft.jpg" />
                  </div>
                  <div className="col-start-1 row-start-1 orange-text text-[5.25vw] sm:text-[3vw] mt-[5vw]">
                    Craft
                  </div>
                </div>
              </div>
              <div className="absolute w-full h-full flex flex-col justify-around  px-[5%] py-[5%] sm:px-[10%] sm:py-[5%] md:px-[10%] md:py-[5%] lg:px-[10%] lg:py-[5%] xl:px-[10%] xl:py-[5%] text-[2.5vw] sm:text-[1.25vw] md:text-[1.25vw] lg:text-[1.25vw] xl:text-[1.25vw] shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] bg-[#FF4F22] text-white rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <p className="max-[300px]:text-[10px] max-[400px]:text-[11px]   max-sm:text-[14px]  max-[500px]:text-[16px]  max-[635px]:text-[18px]  max-md:text-[12px] max-lg:text-[14px]  ">
                  COMPLETE A PROFILE WITH YOUR SKILLS, EXPERIENCE, AND OTHER RELEVANT
                  INFORMATION. YOU CAN DETAIL AS MUCH AS YOU WANT. OUR AI WILL CRAFT A
                  MASTERPIECE CV, TAILORED TO YOUR UNIQUE PROFILE.
                </p>
                <button
                  onClick={goCraft}
                  className="appButton rounded-lg border border-white h-[5vw] sm:h-[3vw] md:h-[3vw] lg:h-[3vw] xl:h-[3vw]"
                >
                  Craft
                </button>
              </div>
            </div>
          </div>
          <div className="group min-w-[70vw] min-h-[70vw] sm:min-w-[35vw] sm:min-h-[35vw] md:min-w-[35vw] md:min-h-[35vw] lg:min-w-[23vw] lg:min-h-[23vw] xl:min-w-[23vw] xl:min-h-[23vw] w-[22vw] h-[22vw] [perspective:1000px]">
            <div className="relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ">
              <div className="absolute w-full h-full justify-center flex flex-col shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] rounded-xl [backface-visibility:hidden]">
                <div className="grid items-center">
                  <div className="col-start-1 row-start-1  w-full">
                    <img className="rounded-xl  w-full" src="/assets/images/optimize.jpg" />
                  </div>
                  <div className="col-start-1 row-start-1 citrine-text text-[5.25vw] sm:text-[3vw] mt-[5vw]">
                    Optimize
                  </div>
                </div>
              </div>
              <div className="absolute w-full h-full flex flex-col justify-around px-[5%] py-[5%] sm:px-[10%] sm:py-[5%] md:px-[10%] md:py-[5%] lg:px-[10%] lg:py-[5%] xl:px-[10%] xl:py-[5%] text-[2.5vw] sm:text-[1.25vw] md:text-[1.25vw] lg:text-[1.25vw] xl:text-[1.25vw] shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] bg-[#DCC80F] text-gray-900 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <p className="max-[300px]:text-[10px] max-[400px]:text-[11px]   max-sm:text-[14px]  max-[500px]:text-[16px]  max-[635px]:text-[18px]  max-md:text-[12px] max-lg:text-[14px]  ">
                  LET'S REVIEW YOUR CURRENT CV. YOU CAN UPLOAD THAT DOC OR PDF FILE YOU HAVE!
                  OUR AI CV GENIUS WILL DEEPLY ANALYZE YOUR CV AND GIVE YOU PROFESSIONAL ADVICE
                  TO ADJUST IT IN ORDER TO MEET YOUR GOALS.
                </p>
                <button
                  onClick={goOptimize}
                  className="appButton rounded-lg border border-white h-[5vw] sm:h-[3vw] md:h-[3vw] lg:h-[3vw] xl:h-[3vw]"
                >
                  Optimize
                </button>
              </div>
            </div>
          </div>
          <div className="group min-w-[70vw] min-h-[70vw] sm:min-w-[35vw] sm:min-h-[35vw] md:min-w-[35vw] md:min-h-[35vw] lg:min-w-[23vw] lg:min-h-[23vw] xl:min-w-[23vw] xl:min-h-[23vw] w-[22vw] h-[22vw] [perspective:1000px]">
            <div className=" relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ">
              <div className="absolute w-full h-full justify-center flex flex-col shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] rounded-xl [backface-visibility:hidden]">
                <div className="grid items-center ">
                  <div className="col-start-1 row-start-1  w-full">
                    <img className="rounded-xl  w-full" src="/assets/images/spotlight.jpg" />
                  </div>
                  <div className="col-start-1 row-start-1 white-text text-[5.25vw] sm:text-[3vw] mt-[5vw]">
                    Spotlight
                  </div>
                </div>
              </div>
              <div className="absolute w-full h-full flex flex-col justify-around  px-[5%] py-[5%] sm:px-[10%] sm:py-[5%] md:px-[10%] md:py-[5%] lg:px-[10%] lg:py-[5%] xl:px-[10%] xl:py-[5%] text-[2.5vw] sm:text-[1.25vw] md:text-[1.25vw] lg:text-[1.25vw] xl:text-[1.25vw] shadow-[0_8px_14px_0_rgba(0,0,0,0.2)] bg-[#dcd8cc] text-gray-900 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <p className="max-[300px]:text-[10px] max-[400px]:text-[11px]   max-sm:text-[14px]  max-[500px]:text-[16px]  max-[635px]:text-[18px]  max-md:text-[12px] max-lg:text-[14px]  ">
                  GET THAT JOB OR COLLEGE ADMISSION! COPY AND PASTE THE REQUIREMENTS. OUR
                  GENIUS WILL PREPARE AND ENHANCE YOUR CV AS THE PERFECT APPLICANT FOR THE
                  SPOT. IT WILL ALSO CREATE AN IMPRESSIVE COVER LETTER.
                </p>
                <button
                  onClick={goSpotlight}
                  className="appButton rounded-lg border border-white h-[5vw] sm:h-[3vw] md:h-[3vw] lg:h-[3vw] xl:h-[3vw]"
                >
                  Spotlight
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withProtected(Apps);
