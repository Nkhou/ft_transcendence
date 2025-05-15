import React, { useState, useEffect, useRef } from 'react';
import Cookie from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { User } from '@/app/utils/userinterface';

interface FriendshipsProps {
    friends: User[];
    setFriends: (value: User[]) => void;
};
const Friendships: React.FC<FriendshipsProps> = ({ friends, setFriends }) => {
    const [friendRequests, setFriendRequests] = useState<{ id: number; sender: string; receiver: string; status: string }[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const { t } = useTranslation();
    const router = useRouter();
    const friendSocketRef = useRef<WebSocket | null>(null);

    const token = Cookie.get('access');
    if (!token) {
        setNotification('No access token found');
        return null;
    }

    useEffect(() => {
        const friendSocket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
        friendSocketRef.current = friendSocket;

        friendSocket.onopen = () => {
            friendSocket.send(JSON.stringify({ action: 'get_pending_friend_requests' }));
            friendSocket.send(JSON.stringify({ action: 'get_friends' }));
        };

        friendSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'friends_list') {
                setFriends(data.friends);
            }

            if (data.type === 'pending_friend_request_notification') {
                setFriendRequests((prev  ) => {
                    const existingRequest = prev.find(request => request.id === data.id);
                    if (!existingRequest) {
                        return [...prev, { id: data.id, sender: data.sender, receiver: data.receiver, status: data.status }];
                    }
                    return prev; 
                });
            }
        };

    }, [token]);

    const handleFriendRequestResponse = async (requestId: number, action: 'accept' | 'reject') => {
        try {
            const socket = friendSocketRef.current;
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                setNotification('WebSocket is not connected.');
                return;
            }
            socket.send(JSON.stringify({
                action: action === 'accept' ? 'accept_friend_request' : 'reject_friend_request',
                friend_request_id: requestId,
            }));
            setNotification(`Friend request ${action}ed successfully.`);
            setFriendRequests((prev) => prev.filter((request) => request.id !== requestId));
            socket.send(JSON.stringify({ action: 'get_friends' }));
        } catch (error: any) {
            setNotification(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 font-[walo]">
            <h1 className="text-white text-3xl font-semibold mb-4">{t('frRequest.friendRequest')}</h1>
            {friendRequests.length > 0 ? (
                <ul className="w-full max-w-lg overflow-auto max-h-[40vh]">
                    {friendRequests.map((request) => (
                        <li key={request.id} className="bg-gray-700 text-white p-4 mb-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-medium">{request.sender}</h2>
                            <p className="text-xs mb-3">{t('frRequest.sentYou')}</p>
                            <div className="flex space-x-4">
                                <button
                                    className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-400"
                                    onClick={() => handleFriendRequestResponse(request.id, 'accept')}
                                >
                                    {t('frRequest.accept')}
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
                                    onClick={() => handleFriendRequestResponse(request.id, 'reject')}
                                >
                                    {t('frRequest.reject')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-white">{t('frRequest.No')}</p>
            )}

           
        </div>
    );
};

export default Friendships;

