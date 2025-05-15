"use client";
import React, { useEffect, useState, useRef } from 'react';
import { User } from '@/app/utils/userinterface';
import News from '../newsbar/news';
import DashboardHeader from './DashboardHeader';
import Image from 'next/image';
import Friends from '../friends/friends';
import { useTranslation } from 'react-i18next';
import Background from '../Background/Background';
import SearchBar from '../search/search';
import SettingsComponent from '../settings/settingsbar';
import cookie from 'js-cookie';
import { api } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import OtherDashboard from './OtherDashboard';
import Events from './Event';
import { Sidebars } from '../sidebars/Side';


const Dashboard: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [isPhoneResolution, setIsPhoneResolution] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
 

  const friendSocketRef = useRef<WebSocket | null>(null);

  const token = cookie.get('access');
  const handleLogout = async () => {
    try {
        const response = await api.get<User>('/api/users/me/', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      cookie.remove('access');
      cookie.remove('refresh');
      router.push('/login-signup');
    } catch (error: any) {
    }
  };
  const updateStatus = async (status: string) => {
    try {
      await api.put("/api/users/update-status/", { status },
        {
          headers:
          {
            Authorization: `Bearer ${cookie.get("access")}`,
          },
        });
    }
    catch (error) {
      console.clear();
    }
  }


  const createWebSocket = () => 
    {
        const token = cookie.get('access');
        const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friends-updates/?token=${token}`);
        socket.onopen = () => {
        };
        socket.onclose = (event) => {
          socket.close();
          setTimeout(createWebSocket, 5000);
        };
        
     
        socket.onmessage = (event) => 
        {
          const data = JSON.parse(event.data);
          if (data.type === 'status_update') 
          {
            setFriends((prev: any) =>
              prev.map((friend :any ) =>
                friend.id === data.friend.id ? { ...friend, is_online: data.friend.is_online } : friend
              )
            );
            // if(friendSocketRef.current?.readyState === WebSocket.OPEN) 
            // {
            //   friendSocketRef.current?.send(JSON.stringify({ action: 'get_friends' }));
            // }
          }
          if (data.type === 'friend_removed') 
          {
            if(friendSocketRef.current?.readyState === WebSocket.OPEN) 
            {
              friendSocketRef.current?.send(JSON.stringify({ action: 'get_friends' }));
            }
          }
        };
      };
  
      
      useEffect(() => {
        createWebSocket();
      }, []);

    useEffect(() => {
      const token = cookie.get('access');
      const fetchUser = async () => {
        if(!token) {
          return;
        }
        const response = await api.get<User>('/api/users/me/', {
          withCredentials: true,
        });

        if(response.status !== 200)
        {
          cookie.remove('access');
          router.push('/login-signup');
        }
        else
        {
        setUser(response.data);
      }
    } 
    fetchUser();
  }, []);

  useEffect(() => {
    if (!token) {
      setError('No access token found');
      return;
    }
    const friendSocket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
    friendSocketRef.current = friendSocket;

    friendSocket.onopen = () => {
      friendSocket.send(JSON.stringify({ action: 'get_friends' }));
    };

    friendSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if(data.type === 'friend_removed') {
        setFriends(data.friends);
      }
      if (data.type === 'friend_blocked') {
        setFriends(data.friends);
      }

      if (data.type === 'friends_list') {
        setFriends(data.friends);
      }
      if ( data.status === 'accepted') {
        friendSocket.send(JSON.stringify({ action: 'get_friends' }));
      }

    };
  }, [token, friendSocketRef, setFriends]);

  useEffect(() => {
    if(cookie.get('game_id')) {
      cookie.remove('game_id');
    }
    updateStatus(t('chat.available'));
    setIsClient(true);

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsPhoneResolution(true);
        document.body.classList.add('no-scroll');
      } else {
        setIsPhoneResolution(false);
        document.body.classList.remove('no-scroll');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('no-scroll');
    };
  }, []);
  

  const handleSettingsToggle = () => setSettingsOpen(!settingsOpen);
  const handleDashboardToggle = () => setDashboardOpen(!dashboardOpen);

 

  if (!isClient || !user) return null;

  return (
    <div className={`relative w-[95%] h-screen flex flex-col gap-4 p-9 mt-[4rem] lg:mx-[4rem] ${isPhoneResolution ? 'phone-view' : ''}`}>
      <source src="s.mp3" type="audio/mpeg" />
      <Background theme="default" />
      <div className="relative z-20 md:mx-[2rem] z-[10] overflow-hidden mt-[-3em]">
        <div className="h-[15vh] overflow-hidden">
          <DashboardHeader user={user} friends={friends} setFriends={setFriends} />
      <div className='my-[2em] flex flex-col w-full '>
          <SearchBar User={user}  friends={friends} setFriends={setFriends} />

      </div>
          <div className="my-[5em] flex flex-col gap-4">
         <News />
            </div>
        </div>
 
        <div className="my-[32dvh] overflow-hidden z-50">
          <Events />
        </div>
      </div>

      {/* Pass the friends and error props to the Friends component */}
      <Friends friends={friends} error={error}  setFriends={setFriends} />
      <SettingsComponent settings={settingsOpen} setSettings={setSettingsOpen} />
      <OtherDashboard Dashboard={dashboardOpen} setDashboard={setDashboardOpen}  statistics={user.statistics}/>

      <div className="fixed flex flex-col gap-2 left-0 mt-[-7.5em] z-[9999999999999999999] h-screen">
        <Sidebars label={user.username} menuOpen={false} toggleMenu={() => {}} currentPath="dashboard" online={true} User={user} logout={handleLogout} handleDashboardToggle={handleDashboardToggle} />
      </div>
      <audio controls autoPlay loop className="hidden">
        <source src="/s.mp3" type="audio/mpeg" />
      </audio>
      <div className="moving-banner bottom-banner text-xs sm:text-sm lg:text-base w-[50vw] bg-transparent font-[walo] z-10 overflow-hidden">
        {t('movingBanner')}
      </div>
    </div>
  );
};

export default Dashboard;
