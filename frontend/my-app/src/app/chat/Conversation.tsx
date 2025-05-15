import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getUserData } from '@/app/chat/chatPr';
import Cookie from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { User } from '../utils/userinterface';
import UserProfile from '../components/profile/picture';
import Image from 'next/image';
import FriendMenu from '../components/friends/friendmenu';
import PlayButton from '../components/friends/Playbutton';
import { api } from '../services/api';
import Friends from '../components/friends/friends';

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
}

interface Props {
    friend: User;
    friends: User[];
    setFriends: (value: User[]) => void;
    globalsocket: WebSocket;
    onBackClick: () => void;
}

const markMessagesAsRead = async (conversationId: string) => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }
    try {
        await api.post(`/api/users/messages/${conversationId}/mark-messages-as-read/`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.clear();
    }
};

const getConversationId = async (friendId: number, currentUserId: string): Promise<string> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }

    try {
        const response = await api.post('/api/users/conversation/', {
            participants: [friendId, currentUserId],
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.id;
    } catch (error) {
        console.clear();
        return '';
    }
};

const getMessages = async (conversationId: string): Promise<Message[]> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }

    try {
        const response = await api.get(`/api/users/messages/${conversationId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.clear();
        throw error;
    }
};

const sendMessage = async (conversationId: string, message: { content: string }, senderId: string): Promise<Message> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }

    const Msg = {
        content: message.content,
        timestamp: new Date().toISOString(),
        conversationId: conversationId,
        senderId: senderId,
    };

    try {
        const response = await api.post(`/api/users/messages/${conversationId}/`, Msg, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.clear();
        throw error;
    }
}

const Conversation: React.FC<Props> = ({ friend, friends, setFriends, globalsocket, onBackClick }) => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationId, setConversationId] = useState<string>('');
    const socket = useRef<WebSocket | null>(null);
    const [get_friend, setGet_friend] = useState<boolean>(false);
    const usersInRoom = useRef<string[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserData();
                setCurrentUser(data.user);
                const conversationId = await getConversationId(friend.id, data.user.id);
                setConversationId(conversationId);
            } catch (error) {
                console.clear();
            }
        };
        fetchUserData();
    }, [friend.id]);

    useEffect(() => {
        if (!conversationId || !currentUser)
            return;
        if (socket.current) {
            socket.current.close();
        }

        const token = Cookie.get('access');
        socket.current = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/chat/${conversationId}/?token=${token}`);

        socket.current.onopen = () => {};

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'user_joined' || data.type === 'user_left') {
                usersInRoom.current = data.users;
            }
            else if (data.type === 'chat_message') {
                const newMsg: Message = {
                    id: data.message_id,
                    content: data.message,
                    sender: data.sender,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                markMessagesAsRead(conversationId);
                setMessages(prevMessages => {
                    if (prevMessages.some(msg => msg.id === newMsg.id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMsg];
                });
            }
        };

        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, [conversationId]);

    const fetchMessages = async () => {
        try {
            const fetchedMessages = await getMessages(conversationId);
            const formattedMessages = fetchedMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender === currentUser?.id ? currentUser?.username : friend.username,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            await markMessagesAsRead(conversationId);
            setMessages(formattedMessages);
            if (globalsocket) {
                globalsocket.send(JSON.stringify({
                    type: "unread_count",
                    unread: true,
                }));
            }
        } catch (error) {
            console.clear();
        }
    };

    const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = await getUserData();

        if (newMessage.trim() !== '') {
            const now = new Date();
            const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newMsg: Message = {
                id: Date.now().toString(),
                content: newMessage,
                sender: data.user.username,
                timestamp: timestamp,
            };
            await markMessagesAsRead(conversationId);
            setMessages(prevMessages => [...prevMessages, newMsg]);
            setNewMessage('');
            if (usersInRoom.current.length == 1) {
                if (globalsocket) {
                    globalsocket.send(JSON.stringify(
                        {
                            type: "unread_count",
                            unread: true,
                        }));
                }
            }
            const sentMsg = await sendMessage(conversationId, { content: newMessage }, currentUser.id);

            try {
                if (socket.current) {
                    socket.current.send(JSON.stringify({
                        message_id: newMsg.id,
                        sender: newMsg.sender,
                        message: newMessage,
                        timestamp: sentMsg.timestamp,
                    }));
                }

            } catch (error) {
                console.clear();
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const { t } = useTranslation();

    return (
        <>
            <div className="flex flex-col h-[50dvh] bg-neutral-700 bg-opacity-70 justify-center rounded-xl w-full max-w-[60em] mx-auto max-h-[100em]">
                <div className="bg-neutral-800"></div>
                <div className="flex items-center p-4 bg-neutral-800 text-white rounded-xl gap-8" onClick={() => setGet_friend(!get_friend)}>
                    <UserProfile profile_picture={friend.profile_picture} width={40} height={40} />
                    <span className="font-light font-[walo] text-2xl text-gradient">{friend.username}</span>
                    <button
                        onClick={onBackClick}
                        className="p-2 text-gradient1 text-[Montserrat] rounded-lg hover:bg-purple-700 font-[abelhid]"
                    >
                       <Image src="/icons/back.svg" alt="Back" width={30} height={30} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === currentUser?.username ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                            <div className={`flex items-start gap-2 ${msg.sender === currentUser?.username ? 'flex-row-reverse' : 'flex-row'}`}>
                                <UserProfile profile_picture={msg.sender === currentUser?.username ? currentUser?.profile_picture : friend.profile_picture} width={40} height={40} />
                                <div className={`p-3 rounded-lg max-w-xs break-words ${msg.sender === currentUser?.username ? 'bg-purple-900 text-white font-[abelhid]' : 'bg-gray-200 text-gray-800'}`}>
                                    <p>{msg.content}</p>
                                    <span className="block text-xs text-gray-300">{msg.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>
                <div className="flex items-center p-4 bg-transparent w-full">
                    <form onSubmit={handleSendMessage} className="flex items-center w-full sm:w-[60vw]">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chat.message')}
                            className="flex-1 p-4 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-neutral-800 placeholder-gray-400"
                            aria-label="Type your message"
                        />
                        <button
                            type="submit"
                            className="p-4 bg-purple-600 text-white rounded-r-xl hover:bg-purple-700 font-bold font-[abelhid] transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500"
                            aria-label="Send message"
                        >
                            {t('chat.send')}
                        </button>
                    </form>
                </div>
                {get_friend && (
                    <div className="fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 backdrop-blur-lg z-[9] font-bold">
                        <div className="text-[#7F00FF] flex flex-col gap-8">
                            <h2 className="text-5xl sm:text-9xl font-light font-[Roquila] my-3">{friend.username}</h2>
                        </div>
                        <UserProfile profile_picture={friend.profile_picture} height={200} width={200} />
                        <div className="text-center my-4 font-[abelhid] text-purple-400">{friend.bio}</div>
                        <div className="flex flex-row my-6 justify-center text-center">
                            <PlayButton selectedFriend={friend} />
                            <div className='z-[999999999]'>
                                <FriendMenu friend_id={friend.id} setFriends={setFriends} />
                            </div>
                        </div>
                        <div onClick={() => setGet_friend(!get_friend)} className="absolute top-5 right-5 cursor-pointer">
                            <Image src="/icons/close.svg" alt="Close" width={40} height={40} className="text-neutral-700 dark:text-white" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Conversation;
