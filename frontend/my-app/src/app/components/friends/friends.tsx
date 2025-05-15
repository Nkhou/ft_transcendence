"use client";
import React, { useState, useEffect,useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User } from '@/app/utils/userinterface';
import { useTranslation } from 'react-i18next';
import FriendMenu from './friendmenu';
import { api } from '@/app/services/api';
import cookie from 'js-cookie';
import UserProfile from '../profile/picture';
import MatchStatsChart from '@/app/components/game/radar';


interface FriendsProps {
  friends: User[];
  setFriends: (value: User[]) => void;
  error: string | null;
}

const Friends: React.FC<FriendsProps> = ({ friends, error ,setFriends}) => {
  const router = useRouter();
  
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const blockedBarRef = useRef<HTMLDivElement | null>(null);
  const progress = (selectedFriend?.score || 0) / 1000 * 100;

  
  const onlineFriendsCount = friends?.filter((friend) => friend.is_online).length;
  
  const toggleFriends = () => {
    setShowFriends(!showFriends);
  };
  
  const { t } = useTranslation();
  
  
  const detectDeviceSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      setIsMobileDevice(width <= 768);
      setIsMediumDevice(width > 768 && width <= 1024);
    }
  };
  
  const handleFriendClick = (friend: User) => {
    setSelectedFriend(friend);
  };
  
  const handleDelete = () => {
    setSelectedFriend(null);
  };
  const redirect_tochat = () => {
    router.push('/chat');
  }



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockedBarRef.current && !blockedBarRef.current.contains(event.target as Node)) {
        setBlocked(false);
      }
    };

    if (blocked) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [blocked]);

  const PlayButton: React.FC<{ selectedFriend: User | null }> = ({ selectedFriend }) => {
    const [websocket, setWebsocket] = useState<WebSocket | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const router = useRouter(); // Using Next.js router
  
    // Establish WebSocket connection
    useEffect(() => {
      const token = cookie.get('access');
      const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/game-request/?token=${token}`);
  
      setWebsocket(socket);
  
      socket.onopen = () => {
       
      };
  
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
  
        if (data.status === 'success') {
          setNotification(t('game_request_sent'));
        } else if (data.status === 'failure') {
          setNotification(t('game_request_failed'));
        } else if (data.status === 'accepted' && data.type === 'game_request_status_update') {
          setNotification(t('game_request_accepted'));
  
          const game_id = data.game_request_id;
          if (game_id) {
            cookie.set('game_id', game_id);
            router.push(`/game/${game_id}`); 
          } else {
            router.push('/game'); 
          }
        } else if (data.status === 'rejected') {
          setNotification(t('game_request_rejected'));
        }
      };

    }, [router]);
  
    const handlePlayClick = useCallback(() => {
      if (websocket && selectedFriend) {
        const message = {
          action: 'send_play_notification',
          receiver_id: selectedFriend.id,
        };
        if(websocket.readyState === WebSocket.OPEN)
          websocket.send(JSON.stringify(message));
        setNotification(t('sending_game_request'));
      }
    }, [websocket, selectedFriend]);
    
   
    return (
        <div>
            <button
                onClick={handlePlayClick}
                className="w-[10rem] h-7 text-white font-[walo] font-bold mx-4 rounded-lg hover:bg-gradient-to-l transition-colors duration-300"
                >
                {t('friends.play')}
            </button>
            {notification && (
              <div className="text-center mt-4 font-bold text-green-500">
                    {notification}
                </div>
            )}
        </div>
    );
};


  useEffect(() => {
    detectDeviceSize();
    window.addEventListener('resize', detectDeviceSize);
    return () => {
      window.removeEventListener('resize', detectDeviceSize);
    };
  }, []);

  if (!friends) {
    return <div className="text-white">You have no friends</div>;
  }

  return (
    <div className="relative flex flex-row">
      <div className="lg:hidden fixed bottom-[5em] right-3 flex justify-center items-center text-white cursor-pointer z-[10]">
        <Image
          src="/icons/friends.svg"
          alt="Friends"
          width={40}
          height={40}
          onClick={toggleFriends}
          className={`${isMobileDevice || isMediumDevice ? 'block' : 'hidden'} md:block`}
        />
        {onlineFriendsCount > 0 && (
          <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex justify-center items-center font-bold animate-pulse">
            {onlineFriendsCount}
          </span>
        )}
      </div>
      <div className={`transition-opacity duration-300 fixed right-4 top-[12vh] h-[50vh] w-[3rem] md:w-[4rem] lg:w-[5rem] p-2 bg-pink-500 bg-opacity-30 rounded-full font-bold my-[7em] ${showFriends || (!isMobileDevice && !isMediumDevice) ? 'opacity-100' : 'opacity-0'} ${isMobileDevice || isMediumDevice ? 'block' : 'hidden lg:block'}`}>
        <div className="w-full flex items-center justify-center flex-col">
          <Image src="/icons/friends.svg" alt="Friends" width={50} height={50} />
        </div>
        <div className="overflow-y-auto h-[30vh] w-full rounded-full font-bold">
          {friends?.map((friend, index) => (
            <div key={index} className="flex flex-col items-center text-center text-white relative cursor-pointer my-7 hover:bg-pink-500 transition-colors duration-300 rounded-full   " onClick={() => handleFriendClick(friend)}>
              <UserProfile profile_picture={friend.profile_picture} height={60} width={60} />
              {friend.is_online ? (
                <span className="absolute bottom-0 right-2 bg-green-500 w-3 h-3 rounded-full" />
              ) : (
                <span className="absolute bottom-0 right-2 bg-red-500 w-3 h-3 rounded-full" />
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-red-500">{error}</p>}

        
      </div>


      

      {selectedFriend && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 backdrop-blur-lg z-[999999] font-bold">
        <div className="text-[#7F00FF] dark:text-white flex flex-col gap-8">
        </div>
        <div className="w-full max-w-md px-4 flex justify-center flex-col items-center mt-[10em]">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-light font-[Roquila] my-3 text-purple-500">{selectedFriend.username}</h2>
        <UserProfile 
          profile_picture={selectedFriend.profile_picture} 
          height={150} 
          width={150} 
        />
          <div className="text-[1rem] font-[walo] text-gray-300 my-[2em]">{t('profile.level')} {selectedFriend.level}</div>
          <div className="relative h-[1em] w-[60%] bg-gray-300 rounded flex items-center">
            <div
              className="h-full bg-purple-500 rounded font-[walo] text-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[1rem] font-[walo] text-neutral-300 mt-2">{progress}%</div>
        </div>
        <div className="flex flex-col sm:flex-row sm:my-6 justify-center text-center">
          <button
            onClick={redirect_tochat}
            className="w-full sm:w-[10rem] h-10 sm:h-7 text-white font-[walo] font-bold mx-4 rounded-lg hover:bg-gradient-to-l transition-colors duration-300 mb-4 sm:mb-0"
          >
            {t('friends.chat')}
          </button>
          <PlayButton selectedFriend={selectedFriend} />
          <FriendMenu friend_id={selectedFriend.id} setFriends={setFriends} />
        </div>
        <div className="text-[#7F00FF] dark:text-white text-center font-bold text-2xl sm:text-3xl md:text-4xl ">{t('stats')}</div>
        <MatchStatsChart 
          matchesWon={selectedFriend.statistics[1]} 
          matchesPlayed={selectedFriend.statistics[0]} 
          matchesLost={selectedFriend.statistics[2]} 
        />
        <div onClick={handleDelete} className="absolute top-5 right-5 cursor-pointer">
          <Image src="/icons/close.svg" alt="Close" width={40} height={40} className="text-neutral-700 dark:text-white" />
        </div>
      </div>
      
      )}
    </div>
  );
};

export default Friends;
