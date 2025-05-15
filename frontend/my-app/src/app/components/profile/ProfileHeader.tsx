import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserProfile from './picture';
import { User } from '../../utils/userinterface';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface TopBarProps {
  User: User | undefined;
  handleProfile: () => void;
  setNotifications: (value: boolean) => void;
  setGameNotifications: (value: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  User,
  handleProfile,
  setNotifications,
  setGameNotifications,
}) => {
 const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false); // State for menu visibility



  const set_game_notifications = () => {
    setGameNotifications(true);
    setNotifications(false);
  }
  const set_notifications = () => {
    setNotifications(true);
    setGameNotifications(false);
  }
  if (!User) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative ">
      <div className="fixed top-0 right-5 flex flex-row space-x-5 items-center md:space-x-6">
        <div className="text-3xl font-[walo] font-semibold text-gradient2">
          <p className="text-1xl md:text-6xl lg:text-[2em] animate-text font-[Roquila] font-light tracking-x-5">
            {t('welcome')} <span className="text-pink-800">{User.username.toUpperCase()}</span>
          </p>
        </div>
        <motion.div
          className="flex items-center flex-col justify-center my-5 rounded-full border-1 border-pink-500 hover:shadow-[0px_0px_15px_5px_rgba(255,182,193,0.7)] transition-all duration-300 ease-in-out"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleProfile}
        >
          <UserProfile profile_picture={User.profile_picture} height={70} width={70} />
        </motion.div>
      </div>

      <div className="fixed left-6 top-10 md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="icon-button group"
        >
          <Image
            src={'/icons/menu.svg'}
            alt="Menu"
            width={40}
            height={40}
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </button>

        {menuOpen && (
          <motion.div
            className="absolute text-white p-4 rounded-lg shadow-lg z-[999999999999999999] "
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setNotifications(true)}
              className="flex items-center space-x-2 py-2"
            >
              <Image
                src={'/icons/friends.svg'}
                alt="Notifications"
                width={30}
                height={30}
              />
              <span>{t('Notifications')}</span>
            </button>
            <button
              onClick={() => setGameNotifications(true)}
              className="flex items-center space-x-2 py-2"
            >
              <Image
                src={'/icons/pingpong.svg'}
                alt="Game Notifications"
                width={30}
                height={30}
              />
              <span>{t('Game Notifications')}</span>
            </button>
          </motion.div>
        )}
      </div>
      <div className="hidden md:flex fixed top-5  items-center space-x-4 md:space-x-6">
        <button
          onClick={set_notifications}
          className="icon-button group"
        >
          <Image
            src={'/icons/friends.svg'}
            alt="Notifications"
            width={40}
            height={40}
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </button>
        <button
          onClick={set_game_notifications}
          className="icon-button group"
        >
          <Image
           src={'/icons/pingpong.svg'}
            alt="Game Notifications"
            width={40}
            height={40}
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
