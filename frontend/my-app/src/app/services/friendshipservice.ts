// services/friendshipService.ts
import { api } from '@/app/services/api';
import { APIResponse, Friendship } from '@/app/utils/userinterface';
import Cookie from 'js-cookie';
import axios from 'axios';



export const sendFriendRequest = async (toUserId: number, token: string): Promise<APIResponse | undefined > => {
    try {
        const response = await api.post<APIResponse>(
            '/api/users/friendship/request/',
            { to_user_id: toUserId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        
        );
        return response.data;
    } catch (error :any) {

        console.clear();
    }
};

export const getUserFriends = async (userId: number): Promise<Friendship[]> => {
    const token = Cookie.get('access');
    if (!token) throw new Error("No access token found");

    try {
        const response = await api.get<Friendship[]>(`/api/users/friendship/${userId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const respondToFriendRequest = async (friendshipId: number, action: 'accept' | 'reject', token: string) => {
    if (!token) throw new Error('No access token found');
    const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({ action: 'respond_to_friend_request'}));
    };

    let data = { type: '' , action: ''};
    socket.onmessage = (event) => {
        data = JSON.parse(event.data);
        if (data.type === 'friend_request_response') {
            socket.close();
        }
    };



    
    return data;
};

export const get_user = async (id: number): Promise<string> => {
    try {
        const token = Cookie.get('access');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await api.get(`/api/users/alluser/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error('Failed to fetch users data');
        }

        const users = response.data;

        const user = users.find((user: { id: number }) => user.id === id);
        
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        return user.username;  // Assuming the response contains `username`
    } catch (error) {
        console.clear();
        throw error;
    }
}


export const respondToGameRequest = async (
    gameRequestId: number,
    action: 'accept' | 'reject',
    token: string
): Promise<{ message: string }> => {
    try {
        const response = await api.post(
            '/api/users/game/request/respond/',
            {
                game_request_id: gameRequestId,
                action: action
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Assuming the API returns a JSON response with a `message` field
        return response.data;
    } catch (error: any) {
        console.clear();
        throw new Error(error.response?.data?.error || 'Failed to respond to game request');
    }
};
