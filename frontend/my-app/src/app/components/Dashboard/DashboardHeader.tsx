import React, { useState } from 'react';
import ProfileComponent from '../profile/ProfileComponent';
import { User } from '../../utils/userinterface';
import TopBar from '../profile/ProfileHeader'; 
import Notifications from '../notifications/notification';
import GameNotifications from '../notifications/Gamenotif';


interface DashboardHeaderProps {
  user: User;
  friends: User[];
  setFriends: (value: User[]) => void;


}

const Chatheader: React.FC<DashboardHeaderProps> = ({ user, friends, setFriends }) => {
 
  const [notifications, setNotifications] = useState(false);
  const [gameNotifications, setGameNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  const handleProfile = () => {
    setProfile(!profile);
  };

  const closeProfile = () => {
    setProfile(false);
  };
  return (
    <div className='absolute z-[10] '>
      <TopBar
        User={user}
        handleProfile={handleProfile}
        setNotifications={setNotifications}
        setGameNotifications={setGameNotifications}
      />
      <ProfileComponent profile={profile} closeProfile={closeProfile} user={user} />
      <Notifications setNotifications={setNotifications} notifications={notifications}  friends={friends} setFriends={setFriends} />
      <GameNotifications setNotifications={setGameNotifications} notifications={gameNotifications} />
    </div>
  );
};

export default Chatheader;
