import React, { useState, useEffect } from 'react';
import { User } from '@/app/utils/userinterface';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import UserProfile from './picture';
import { api } from '../../services/api';
import Edit from './edit';
import Image from 'next/image';
import MatchStatsChart from '@/app/components/game/radar';

interface ProfileProps {
  User: User | null;
}

const Profile: React.FC<ProfileProps> = ({ User }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  if (!User) {
    return <div>Loading...</div>;
  }
  let userscore = User.score || 0;
  let progress = (userscore / 1000) * 100;

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center backdrop-blur-lg z-[999999] font-bold font-white">
      <div className="backdrop-blur-xl p-8 rounded-lg shadow-lg w-full max-w-2xl">
        {!isEditing ? (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-9xl font-light my-4 font-[Roquila] text-white">{User.username}</h2>
            <div className="relative my-7">
              <button
                onClick={handleEditClick}
                className='font-[walo] absolute bottom-0 right-5'>
                <Image src={'/icons/pencil.svg'} alt="Edit" width={20} height={20} />
              </button>
              <UserProfile profile_picture={User.profile_picture} height={200} width={200} />
              <p className="mt-2 text-sm font-light font-[abelhid] text-purple-500">{User.bio}</p>
            </div>
            {/* Fixed progress bar section */}
            <div className="w-full max-w-md px-4">
              <div className="text-[1rem] font-[walo] text-gray-300 mb-2">{t('profile.level')} {User.level}</div>
              <div className="relative h-[1em] w-full bg-gray-300 rounded flex items-center">
                <div
                  className="h-full bg-pink-500 rounded font-[walo] text-white"
                  style={{ width: `${progress}%` }}
                >
                </div>
              </div>
              <div className="text-[1rem] font-[walo] text-neutral-300 mt-2">{progress}%</div>
            </div>
          </div>
        ) : (
          <Edit
            User={User}
            IsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;