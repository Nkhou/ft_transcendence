import React, { useState } from 'react';
import Image from 'next/image';
import Friendships from './not';
import { User } from '@/app/utils/userinterface';

interface NotificationsProps {
    setNotifications: (value: boolean) => void;
    notifications: boolean;
    friends: User[];
    setFriends: (value: User[]) => void;

}

const Notifications: React.FC<NotificationsProps> = ({ setNotifications ,notifications, friends, setFriends }) => {



  return (
    <>

      {notifications && (
       <div className="absolute  w-[20rem]  overflow-hidden z-50 bg-black bg-opacity-70 ">
          <button
            onClick={() => setNotifications(false)}
            className="absolute top-4 right-4 z-50 p-2 shadow-md text-white "
          >
            <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
          </button>
          <Friendships  friends={friends} setFriends={setFriends}/>
        </div>
      )}
    </>
  );
};

export default Notifications;
