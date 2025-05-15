import React from 'react'
import { User } from '../../utils/userinterface';
import { IconCameraAi } from '@tabler/icons-react';
import UserProfile from './picture';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useEffect } from 'react';
import { api } from '../../services/api';



interface Props {

    User : User | null;
    IsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const edit: React.FC<Props> = ({User ,IsEditing}) => {
    const [username, setUsername] = useState(User?.username || '');
    const [bio, setBio] = useState(User?.bio || '');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [notifications,setNotifications] = useState<string>("");


    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(!(e.target.value.length >= 10))
        setUsername(e.target.value);
      else{
        setNotifications(t('bio.nameerr'))
      }
      };
    
      const handleChangeProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setProfilePicture(file);
          const objectURL = URL.createObjectURL(file);
          setPreviewURL(objectURL);
        }
      };
    
      const handleChangeBio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(!(e.target.value.length >= 30))
          setBio(e.target.value);
        else
        {
          setNotifications(t('bio.toolong'))
          
        }
      };
    
      const handleCancelProfile = () => {
        setUsername(User?.username || '');
        setProfilePicture(null);
        setBio(User?.bio || '');
        setPreviewURL(null);
        IsEditing(false);
        
      };
    
      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = Cookies.get('access');
        const formData = new FormData();
    
        if (profilePicture) {
          formData.append('profile_picture', profilePicture);
        }
        formData.append('username', username);
        formData.append('bio', bio);
    
        try {
          const response = await api.put(`/api/users/users/${User?.id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
          });
    
          const updatedUser = response.data;
          if (User) {
            User.username = updatedUser.username;
            User.profile_picture = updatedUser.profile_picture;
            User.bio = updatedUser.bio;
          }
          IsEditing(false);
          alert(t('profileUpdated'));
        } catch (error) {
        }
      };
    
      useEffect(() => {
        return () => {
          if (previewURL) {
            URL.revokeObjectURL(previewURL);
          }
        };
      }, [previewURL]);
    

    const { t } = useTranslation();
    

    return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-[60vh] ">
            {/* Profile Picture Section */}
            <div className="relative flex justify-center  ">
              {/* Preview Picture */}
              {previewURL && (
                <div className="relative">
                  <img
                    src={previewURL}
                    alt="Profile preview"
                    className="rounded-full"
                    height={200} 
                    width={200}  
                  />
                </div>
              )}
              <div
                className="absolute flex justify-center items-center bg-black bg-opacity-90 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer h-[200px] w-[200px] text-[walo]" 
                onClick={() => document.getElementById('profile-picture-input')?.click()}
              >
                <IconCameraAi size={100} color='#fff' />
              </div>
              {!previewURL && (
                <UserProfile profile_picture={User?.profile_picture} height={200} width={200} /> 
              )}
            </div>
            <input
              type="file"
              id="profile-picture-input"
              accept="image/*"
              onChange={handleChangeProfilePicture}
              className="hidden"
              />
            <label htmlFor="username" className="text-lg font-[walo] font-semibold text-gray-800 dark:text-gray-200">
              {t('profile.username')}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleChangeUsername}
              className="p-2 font-[hossine] rounded-xl text-purple-300 border border-gray-500 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none bg-black "
              placeholder={t('profile.username')}
            />

            <label htmlFor="bio" className="text-lg font-[walo] font-semibold text-gray-800 dark:text-gray-200">
              {t('profile.bio')}
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={handleChangeBio}
              className="p-8 font-[hossine] rounded-xl text-purple-300 border border-gray-500 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none bg-black "
              placeholder={t('profile.bio')}
            />

            {notifications && (
              
              <div className="text-red-500 font-bold text-center">{notifications}</div>
            )}
            

            {/* Buttons */}
            <div className="flex justify-between gap-6 mt-8 font-[walo]">
              <button
                type="button"
                onClick={handleCancelProfile}
                className='px-6 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-400 transition-all duration-200'>
                {t('profile.cancel')}
              </button>
              <button
                type="submit"
                className='px-6 py-2 bg-purple-900 text-white font-bold rounded hover:bg-purple-800 transition-all duration-200'>
                {t('profile.save')}
              </button>
            </div>
          </form>
          
    )
}

export default edit
