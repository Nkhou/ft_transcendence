import React, { useEffect, useState } from 'react';
import '@/app/chat/style.css';
import { useTranslation } from 'react-i18next';
import { User } from '@/app/utils/userinterface';
import UserProfile from '@/app/components/profile/picture';
import Cookie from 'js-cookie';
import { api } from '@/app/services/api';
import Image from 'next/image';
interface Props {
    friends: User[];
    onFriendClick: (friend: User) => void;
}

const getUnreadMessages = async (friend_id: string) => {
    try {
        const response = await api.get(`/api/users/${friend_id}/unread/`, {
            headers: { Authorization: `Bearer ${Cookie.get('access')}` },
        });
        return response.data.count;
    } catch (error) {
        console.clear();
        return 0;
    }
};

const FriendList: React.FC<Props> = ({ friends, onFriendClick }) => {
    const { t } = useTranslation();
    const [Counts, setCounts] = useState<Record<string, number>>({});
    const [isVisible, setIsVisible] = useState<boolean>(false);  // Sidebar toggle visibility

    useEffect(() => {
        const fetchCounts = async () => {
            const counts: Record<string, number> = {};
            for (const friend of friends) {
                const count = await getUnreadMessages(String(friend.id));
                counts[friend.id] = count;
            }
            setCounts(counts);
        };

        if (friends.length > 0) {
            fetchCounts();
        }
    }, [friends]);

    const toggleSidebar = () => {
        setIsVisible(prevState => !prevState);
    };
   
  

    return (
        <div className="relative w-full h-full font-[walo]">
            {/* Button to toggle sidebar on mobile */}
            <button
                className="sidebar-toggle-btn sm:hidden"
                onClick={toggleSidebar}
            >
                {isVisible ? '':
                <Image src='/icons/friends.svg' alt='Friends' width={30} height={30} className='text-neutral-700 dark:text-white' />
                }
            </button>

            {/* Sidebar (Mobile view) */}
            <div className={`friend-list-sidebar ${isVisible ? 'show' : ''}`}>
                <h3 className="text-2xl sm:text-3xl text-center font-semibold mb-4 font-[walo] text-gradient3">{t('chat.friends')}</h3>

                {/* Friend list */}
                <div className="w-full">

                    {friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="flex items-center justify-between w-full p-2 my-2 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors"
                            onClick={() => onFriendClick(friend)}
                        >
                            {isVisible && (
                                <div className="fixed top-5 right-3">
                                <Image src='/icons/close.svg' alt='Close' width={20} height={20} className='text-neutral-700 dark:text-white'  />
                                </div >
                                )}
                            <div className="flex items-center sm:hidden space-x-2">
                                <div className="relative">
                                    <UserProfile profile_picture={friend.profile_picture} height={40} width={40} />
                                    {friend.status === 'unavailable' ? (
                                            <span className="text-xs sm:text-sm font-medium text-red-500 bg-red-200 px-2 py-1 rounded-full inline-block mt-1">
                                            </span>
                                        ) : (
                                            <>
                                            <span className="text-xs sm:text-sm font-medium text-green-500 bg-green-200 px-2 py-1 rounded-full inline-block mt-1">
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-green-500 bg-green-200 px-2 py-1 rounded-full inline-block mt-1">
                                            {
                                                // friend.status
                                                friend.status === 'available' ? t('chat.available') :
                                                friend.status === 'In Tournament' ? t('chat.inTournament') :
                                                friend.status === 'playing' ? t('chat.playing') :
                                                t('chat.available')
                                                
                                            }
                                            </p>
                                            </>
                                        )
                                        }
                                </div>
                                    <p className="text-xs sm:text-sm font-medium text-white bg-gray-800 px-2 py-1 rounded-full inline-block mt-1">
                                        {friend.username}
                                        </p>
                            </div>

                            {/* Desktop Detailed View */}
                            <div className="hidden sm:flex items-center sm:space-x-4 sm:flex-row text-[walo]">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full">
                                    <UserProfile profile_picture={friend.profile_picture} height={50} width={50} />
                                </div>
                                <div className="ml-4">
                                    <span className="text-white block text-sm sm:text-base">{friend.username}</span>
                                  
                                        {friend.status === 'unavailable' ? (
                                            <span className="text-xs sm:text-sm font-medium text-red-500 bg-red-200 px-2 py-1 rounded-full inline-block mt-1">
                                            </span>
                                        ) : (
                                            <>
                                            <span className="text-xs sm:text-sm font-medium text-green-500 bg-green-200 px-2 py-1 rounded-full inline-block mt-1">
                                            </span>
                                            <p className="text-xs sm:text-sm font-medium text-green-500 bg-green-200 px-2 py-1 rounded-full inline-block mt-1">
                                            {friend.status === 'available' ? t('chat.available') :
                                                friend.status === 'In Tournament' ? t('chat.inTournament') :
                                                friend.status === 'playing' ? t('chat.playing') :
                                                t('chat.available')}
                                            </p>
                                            </>
                                        )
                                        }
                                </div>
                            </div>

                            {/* Unread Message Count */}
                            {Counts[friend.id] > 0 && (
                                <span className="text-xs sm:text-sm font-semibold text-red-500 bg-red-200 px-2 py-1 rounded-full">
                                    {Counts[friend.id]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FriendList;
