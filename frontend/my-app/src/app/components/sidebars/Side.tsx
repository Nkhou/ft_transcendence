import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ll";
import {
  IconArrowLeft,
  IconPingPong,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/app/utils/userinterface";
import Settings from "../settings/settings";
import Profile from "../profile/profile";
import { api } from "@/app/services/api";
import { useTranslation } from "react-i18next";
import Cookie from "js-cookie";
import LanguageSwitcher from "../languageComponents/languageswitcher";
import ProfileComponent from "../profile/ProfileComponent";
import UserProfile from "../profile/picture";
import Spinner from "../styles/loader";

interface SidebarLinkProps {
  label: string | undefined;
  href: string;
  icon: React.ReactNode;
}

interface SidebarsProps {
  label: string | undefined;
  menuOpen: boolean;
  toggleMenu: () => void;
  currentPath: string;
  online: boolean;
  logout: () => void;
  User: User | null;
  handleDashboardToggle : () => void;
}

export function Sidebars({ label, menuOpen, toggleMenu, currentPath, online, logout ,User, handleDashboardToggle}: SidebarsProps) {
  const [open, setOpen] = useState(menuOpen);
  const [settings, setSettings] = useState(false);
  const [profile, setProfile] = useState(false);
  const [user, setUser] = useState<User | null>(User || null);
  const { t } = useTranslation();

  const fetchUserData = async () => {
    try {
     const accessToken = Cookie.get('access');
      const response = await api.get('/api/users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },

      });
      setUser(response.data);


    } catch (error) {
      console.clear();
    }
  }


  useEffect(() => {
    fetchUserData();

  }, []);


  const handleSidebarToggle = () => {
    setOpen(!open);
  };

  const togglesettings = () => {
    setSettings(!settings);
  };

  const toggleprofile = () => {
    setProfile(!profile);
  };

  const baseLinks: SidebarLinkProps[] = [
    ...(currentPath === 'dashboard'
      ? [
         
     
          {
            label: t('sidebar.Chat') ?? "",
            href: "/chat",
            icon: <Image src='/icons/chat.svg' alt='Chat Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
          {
            label: t('sidebar.game') ?? "",
            href: "/game",
            icon: <Image src='/icons/pingpong.svg' alt='Game Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
        ]
      : []),
    ...(currentPath === 'tournament'
      ? [
          {
            label: t('sidebar.Chat') ?? "",
            href: "/chat",
            icon: <Image src='/icons/chat.svg' alt='Chat Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
          {
            label: t('sidebar.game') ?? "",
            href: "/game",
            icon: <Image src='/icons/pingpong.svg' alt='Game Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
        ]
      : []),
    ...(currentPath === 'game' 
      ? [
          {
            label: t('sidebar.Dashboard') ?? "",
            href: "/dashboard",
            icon: <Image src='/icons/dashboard.svg' alt='Dashboard Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
          {
            label: t('sidebar.Chat') ?? "",
            href: "/chat",
            icon: <Image src='/icons/chat.svg' alt='Chat Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
        ]
      : []),
    ...(currentPath === 'chat'
      ? [
          {
            label: t('sidebar.Dashboard') ?? "",
            href: "/dashboard",
            icon: <Image src='/icons/dashboard.svg' alt='Dashboard Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
          {
            label: t('sidebar.game') ?? "",
            href: "/game",
            icon: <Image src='/icons/pingpong.svg' alt='Game Icon' width={50} height={50} className="text-neutral-700 dark:text-white" />,
          },
        ]
      : []),
  ];
  if(!user){
    return <Spinner />;
  }

  return (
    <div className="relative flex  h-screen ">
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 dark:bg-[#7F00FF] border-r border-neutral-200 dark:border-[#7F00FF] transition-transform duration-300 ease-in-out transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } z-20 lg:translate-x-0 lg:relative lg:shadow-none lg:bg-purple lg:border-none lg:dark:bg-transparent lg:dark:border-none lg:z-0 lg:w-94`}
      >
        
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="flex flex-col justify-between gap-10 dark:bg-black font-[walo] z-[-1]">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              {open &&
              
              <div className="fixed mt-[20vh] flex flex-col gap-9 sm:gap-10 w-[20rem] overflow-hidden z-[10]">
                {baseLinks.map((link: any, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    className=" "
                  />
                ))}

                <SidebarLink 
                  link={{
                    label: t('sidebar.profile') ?? "",
                    href: "#",
                    icon: (
                      <Image onClick={toggleprofile}
                        src="/icons/profile.svg"
                        alt="Profile Icon"
                        width={50}
                        height={50}
                        className="text-neutral-700 dark:text-white"
                      />
                    ),
                  }}
                  className=" " 
                />

                <SidebarLink
                  link={{
                    label: t('sidebar.settings') ?? "",
                    href: "#",
                    icon: (
                      <Image
                        src="/icons/settings.svg"
                        alt="Settings Icon"
                        width={50}
                        height={50}
                        className="text-neutral-700 dark:text-white"
                        onClick={togglesettings}
                        />
                    ),
                  }}
                  className="" 
                />
                {currentPath === 'dashboard' &&
                  <div className="flex flex-col gap-4" onClick={handleDashboardToggle}>
                    <SidebarLink
                      link={{
                        label: t('sidebar.Dashboard') ?? "",
                        href: "#",
                        icon: <Image src='/wayli.svg' alt='Logout Icon' width={60} height={60} className="text-neutral-700 dark:text-white" />,
                      }}
                      className="pointer-events-auto " 
                    />
                  </div>
}
            <div className="flex flex-col gap-4" onClick={logout}>
              <SidebarLink
                link={{
                  label: t('sidebar.logout') ?? "",
                  href: "#",
                  icon: <Image src='/icons/logout.svg' alt='Logout Icon' width={60} height={60} className="text-neutral-700 dark:text-white" />,
                }}
                className="pointer-events-auto " 
              />
            </div>
              </div>
              
              }
              
            </div>


            <div className="p-4">
              <SidebarLink
                link={{
                  label: user?.username,
                  href: "#",
                  icon: (
                    <div className="my-3">
                      <UserProfile profile_picture={user?.profile_picture} height={40} width={40} />
                    </div>
                  ),
                }}
                className="pointer-events-auto " 
              />
            </div>
          </SidebarBody>
        </Sidebar>
        
        
      </div>
                
      {settings && (
        <div className="absolute flex w-screen h-screen bg-opacity-90 blur-2 z-[99999]">
          <Settings setSettings={togglesettings} />
        </div>
      )}

      {profile && (
        <div className="absolute flex w-screen h-screen bg-opacity-90 blur-2 z-[99999]">
          <ProfileComponent user={user} profile={profile} closeProfile={toggleprofile}/>
          <button
            onClick={toggleprofile}
            className="fixed top-4 right-4 z-50 p-2 shadow-md text-white"
          >
            <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
          </button>
        </div>
      )}

      <button
        onClick={handleSidebarToggle}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-purple-700 shadow-md lg:hidden"
      >
        <IconArrowLeft className="w-6 h-6" />
      </button>
     

      {/* <div className="fixed flex top-4 right-[8rem] text-white">
        <Image src="/icons/notif.svg" alt="LoL Logo" width={48} height={48} className="w-12 h-12" />
      </div> */}
    </div>
  );
}

// Logo components
export const Logo = () => (
  <Link
    href="#"
    className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
  >
    <IconPingPong className="w-10 h-10 text-[#7F00FF]" />
  </Link>
);

export const LogoIcon = () => (
  <Link
    href="#"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <IconPingPong className="w-10 h-10 text-[#7F00FF]" />
  </Link>
);
