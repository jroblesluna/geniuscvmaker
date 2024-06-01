import React from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button, menuItem } from "@nextui-org/react";
import { useRouter } from 'next/router'; // Import Next.js router

import SvgLogo from "./svgLogo";
import SvgHome from './svgHome';
import SvgApps from './svgApps';
import SvgList from './svgList';
import SvgLogout from './svgLogout';
import SvgWallet from './svgWallet';

function GeniusNavbar({ auth }) {
  const router = useRouter(); // Initialize Next.js router
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { logout } = auth;


  const menuItems = [
    { path: "/", command: goHome, name: "Home" },
    { path: "/profile", command: goProfile, name: "My Profile" },
    { path: "/apps", command: goApps, name: "My CV Apps" },
    { path: "/scratch", command: goScratch, name: "Start my CV from Scratch" },
    { path: "/craft", command: goCraft, name: "Craft my CV" },
    { path: "/optimize", command: goOptimize, name: "Optimize my CV" },
    { path: "/spotlight", command: goSpotlight, name: "Spotlight my CV" },
    { path: "/cvList", command: goList, name: "My CV's List" },
    { path: "/paymentMethods", command: goPaymentMethods, name: "My Payment Methods" },
    { path: "/subscriptions", command: goSubscriptions, name: "Buy Subscription" },
    { path: "/support", command: goSupport, name: "Help & Support" },
    { path: "/logout", command: logout, name: "Log Out" },
  ];

  function goHome() { router.push('/') }
  function goProfile() { router.push('/profile') }
  function goApps() { router.push('/apps') }
  function goScratch() { router.push('/scratch') }
  function goCraft() { router.push('/craft') }
  function goOptimize() { router.push('/optimize') }
  function goSpotlight() { router.push('/spotlight') }
  function goList() { router.push('/cvList') }
  function goPaymentMethods() { router.push('/paymentMethods') }
  function goSubscriptions() { router.push('/subscriptions') }
  function goSupport() { router.push('/support') }

  return (
    <>
      <Navbar onMenuOpenChange={setIsMenuOpen} className='bg-gray-200' maxWidth='full'>
        <NavbarContent className='justify-start p-0'>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            style={{ color: "#FF4F22" }} />
          <NavbarMenu>
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.path}-${index}`}>
                <div
                  className={`w-fit cursor-pointer topic-text-${(router.pathname === item.path) ? "blue" : (index === menuItems.length - 1) ? "orange" : "darkgray"}`}
                  onClick={item.command}
                >
                  {item.name}
                </div>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </NavbarContent>
        <NavbarContent className="justify-center gap-[2vw] p-0">
          <NavbarItem>
            <button onClick={goHome}>
              <div className='flex flex-col items-center'>
                <div><SvgHome /></div>
                <div className='text-[#FF4F22] font-medium'>Home</div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={goApps}>
              <div className='flex flex-col items-center'>
                <div><SvgApps /></div>
                <div className='text-[#FF4F22] font-medium'>Apps</div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={goList}>
              <div className='flex flex-col items-center'>
                <div><SvgList /></div>
                <div className='text-[#FF4F22] font-medium'>CV's</div>
              </div>
            </button>
          </NavbarItem>
          <NavbarItem>
            <button onClick={logout}>
              <div className='flex flex-col items-center'>
                <div><SvgLogout /></div>
                <div className='text-[#FF4F22] font-medium'>Exit</div>
              </div>
            </button>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent className='justify-end p-0'>
          <NavbarBrand className="flex flex-col justify-center items-end h-full">
            <div className='flex flex-col gap-1 items-end'>
              <div className='flex flex-row'>
                <div className="w-4 h-6 px-0 mx-1">
                  <SvgLogo fillColor="#FF4F22" />
                </div>
                <div className="">CV Maker</div>
              </div>
              <div className='rounded-md px-2 py-0.5 appBlackOnCitrine flex flex-row'>
                <SvgWallet />
                <div>10000</div>
              </div>
            </div>
          </NavbarBrand>
        </NavbarContent>

      </Navbar>
    </>
  )
}

export default GeniusNavbar;