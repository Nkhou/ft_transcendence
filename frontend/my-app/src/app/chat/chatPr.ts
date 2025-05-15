import axios from 'axios';
import {api } from '@/app/services/api';
import Cookie from 'js-cookie';
import { Conversation } from '@/app/chat/page';

export const createUsersConversation = async (friendId: string, currentUserId: string): Promise<Conversation> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }
    try {
        const response = await api.post('/api/users/conversation/',
            { participants: [friendId, currentUserId] },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error) {
       console.clear();
       return { id: '', participants: [], messages: [] };
    }
}

export const getUserConversations = async (): Promise<Conversation[]> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }
    try {
        const response = await api.get('/api/users/conversation/', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.clear();
        return [];
    }
};

export const getUserData = async (): Promise<{ user: any; conversations: Conversation[] }> => {
    const token = Cookie.get('access');
    if (!token) {
        throw new Error('No token found');
    }
    try {
        const userResponse = await api.get('/api/users/user/', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const conversationsResponse = await api.get('/api/users/conversation/', {
            headers: { Authorization: `Bearer ${token}` },
        });

        return {
            user: userResponse.data,
            conversations: conversationsResponse.data,
        };
    } catch (error) {
        console.clear();
        throw [];
    }
};

export const alluserdata = async (token: string): Promise<any[]> => {

    const response = await api.get('/api/users/alluser/', {
        headers: { Authorization: `Bearer ${token}` },
    });

    const response2 = await api.get('api/users/allNotBlocked/', {
        headers: { Authorization: `Bearer ${token}` },
    });

    const blockedUserIds = response2.data.map((user: { id: any; })  => user.id);
    const filteredUsers = response.data.filter((user: { id: any; }) => !blockedUserIds.includes(user.id)); 

    return filteredUsers;
}
