import React, { useState, useEffect, useCallback } from 'react';
import cookie from 'js-cookie';
import { alluserdata } from '@/app/chat/chatPr';
import UserProfile from '../profile/picture';
import { User } from '../../utils/userinterface';
import SearchComponent from './searchbar';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface SearchComponentProps {
  User: User;
  friends: User[];
  setFriends: (value: User[]) => void;
}

const SearchBar: React.FC<SearchComponentProps> = ({ User, friends, setFriends }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleUserClick = (user: User) => setSelectedUser(user);

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const token = cookie.get('access');
    setSearchTerm(value);

    if (value === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await alluserdata(token as string);
      const results = response.filter(
        (result: any) =>
          result.username.toLowerCase().includes(value.toLowerCase()) &&
          result.id !== User.id
      );
      setSearchResults(results);
    } catch (error) {
      console.clear();
    }
  };

  const handleSendRequest = useCallback(() => {
    const token = cookie.get('access');
    const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);

    socket.onopen = () => {
      if (selectedUser) {
        const message = {
          action: 'send_friend_request',
          receiver_id: selectedUser.id,
        };
        socket.send(JSON.stringify(message));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.type === 'friend_list') {
        setFriends(data.friends);
      }

      let message = '';
      if (data.message === 'You have already sent a request to this user') {
        message = t('search.friendRequestSent');
      } else if (data.message === 'You are already friends.') {
        message = t('search.alreadyFriends');
      } else if (data.message === 'You have already sent a request to this user.') {
        message = t('search.alrfriendRequestSent');
      } else if (data.message === 'You have already recieved a request from this user.') {
        message = t('search.alrRequestRecieved');
        
      }
      else {
        message = t('search.Accepted');
      }
      setNotification(message);

      setTimeout(() => {
        setNotification(null);
      }, 2000); 
    };
  }, [selectedUser]);

  const closeUser = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Search Input */}
      <div className="flex flex-col items-center ">
        <SearchComponent handleSearchChange={handleSearchChange} />
      </div>

      <div className="absolute top-full mt-5 w-[90%] bg-black bg-opacity-75 backdrop-blur-md shadow-neon-neon rounded-lg max-h-[calc(100vh-8rem)] overflow-auto z-[9999999999999]">
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((result: any) => (
              <li
                key={result.id}
                className="p-2 text-white cursor-pointer hover:text-neon-green hover:bg-gray-800 transition-colors flex justify-between items-center font-[walo]"
                onClick={() => handleUserClick(result)}
              >
                <UserProfile profile_picture={result.profile_picture} height={50} width={50} />
                {result.username}
                <p>{t('profile.level')} {result.level}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 backdrop-blur-xl z-[9999999999999999999] font-bold text-purple-100">
          <h2 className="text-9xl font-light my-3 text-purple-100 font-[Roquila]">{selectedUser.username}</h2>

          <UserProfile profile_picture={selectedUser.profile_picture} height={200} width={200} />
          <p className='font-[abelhid] my-9'>{selectedUser.bio}</p>

          <div className="flex flex-row my-6 justify-center text-center" onClick={handleSendRequest}>
            <button className="w-[10rem] h-7 text-white font-bold mx-4 font-[hossine]">
              {t('search.addFriend')}
            </button>
          </div>

          <button
            onClick={closeUser}
            className="absolute top-3 right-3 p-2 text-white rounded-lg shadow-lg transition-transform transform hover:scale-110 "
          >
            <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
          </button>
          {notification && (
            <div className="fixed bottom-4 left-9 bg-green-600 text-white p-2 rounded shadow">
              {notification}
            </div>
          )}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 center bg-green-600 text-white p-2 rounded shadow font-[walo]">
          {notification}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
