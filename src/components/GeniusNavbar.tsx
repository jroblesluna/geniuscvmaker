import React, { useEffect, useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  user,
} from '@nextui-org/react';
import { useRouter } from 'next/router'; // Import Next.js router

import SvgLogo from './svgLogo';
import SvgHome from './svgHome';
import SvgApps from './svgApps';
import SvgList from './svgList';
import SvgLogout from './svgLogout';
import SvgWallet from './svgWallet';
import {
  goHome,
  goScratch,
  goCraft,
  goOptimize,
  goSpotlight,
  goPaymentMethods,
  goSubscriptions,
  goProfile,
  goApps,
  goList,
  goSupport,
} from '../utils/navigateRoutes';
import { getFirestore, doc, getDoc, DocumentData } from '@firebase/firestore';

function GeniusNavbar({ auth }) {
  const router = useRouter(); // Initialize Next.js router
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const { user, setUser, logout } = auth;
  const menuItems = [
    { path: '/', command: goHome, name: 'Home' },
    { path: '/profile', command: goProfile, name: 'My Profile' },
    { path: '/apps', command: goApps, name: 'My CV Apps' },
    { path: '/scratch', command: goScratch, name: 'Start my CV from Scratch' },
    { path: '/craft', command: goCraft, name: 'Craft my CV' },
    { path: '/optimize', command: goOptimize, name: 'Optimize my CV' },
    { path: '/spotlight', command: goSpotlight, name: 'Spotlight my CV' },
    { path: '/cvList', command: goList, name: "My CV's List" },
    { path: '/paymentMethods', command: goPaymentMethods, name: 'My Payment Methods' },
    { path: '/subscriptions', command: goSubscriptions, name: 'Buy Subscription' },
    { path: '/support', command: goSupport, name: 'Help & Support' },
    { path: '/logout', command: logout, name: 'Log Out' },
  ];

  useEffect(() => {
    fetchUserProfile();
  });

  async function fetchUserProfile() {
    console.log('fetchUserProfile');
    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      console.log('userDocSnapshot', userDocSnapshot);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserData(userData);
        return true;
      } else {
        console.log("The user document doesn't exist");
        return false;
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return false;
    }
  }

  return (
    <>
      <Navbar onMenuOpenChange={setIsMenuOpen} className="bg-gray-100  py-1" maxWidth="full">
        <NavbarContent className="justify-start p-0  ">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            style={{ color: '#FF4F22' }}
          />
          <NavbarMenu className="p-0 gap-0 mt-2 bg-white opacity-95">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.path}-${index}`} className="list-none ">
                <div
                  className={`w-full border py-1 px-2 hover:bg-gray-100  cursor-pointer topic-text-${
                    router.pathname === item.path
                      ? 'blue '
                      : index === menuItems.length - 1
                      ? 'orange'
                      : 'darkgray'
                  }`}
                  onClick={item.command}
                >
                  <p className="active:font-bold hover:font-bold"> {item.name}</p>
                </div>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </NavbarContent>
        <NavbarContent
          className=" gap-[2vw] p-0 hidden md:flex  flex-row justify-center "
          justify="center"
        >
          <NavbarItem className="">
            <button onClick={goHome}>
              <div className="flex flex-col items-center hover:opacity-70  active:opacity-70 ">
                <div>
                  <SvgHome />
                </div>
                <div className="text-[#FF4F22] font-medium hover:opacity-70  active:opacity-70 ">
                  Home
                </div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={goApps}>
              <div className="flex flex-col items-center hover:opacity-70 active:opacity-70 ">
                <div>
                  <SvgApps />
                </div>
                <div className="text-[#FF4F22] font-medium">Apps</div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={goList}>
              <div className="flex flex-col items-center hover:opacity-70 active:opacity-70">
                <div>
                  <SvgList />
                </div>
                <div className="text-[#FF4F22] font-medium">CV's</div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={logout}>
              <div className="flex flex-col items-center hover:opacity-70 active:opacity-70  ">
                <div>
                  <SvgLogout />
                </div>
                <div className="text-[#FF4F22] font-medium">Exit</div>
              </div>
            </button>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent className="justify-end p-0 ">
          <NavbarBrand className="flex  flex-col    justify-center items-end h-full">
            <div className="flex flex-row-reverse md:flex-col   gap-2 items-end">
              <div
                className="flex flex-row  hover:opacity-70  active:opacity-70 cursor-pointer"
                onClick={goHome}
              >
                <div className="w-4 h-6 px-0 mx-1">
                  <SvgLogo fillColor="#FF4F22" />
                </div>
                <div className="">CV Maker</div>
              </div>
              <div className="rounded-md  px-1 py-0.5 appBlackOnCitrine flex flex-row -mt-1">
                <SvgWallet />
                <div className="text-xs text-center flex justify-center items-center md:text-sm ">
                  {userData ? userData.tokens : ''}
                </div>
              </div>
            </div>
          </NavbarBrand>
        </NavbarContent>
      </Navbar>
    </>
  );
}

export default GeniusNavbar;
