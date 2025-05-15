import axios from 'axios';
import Cookies from 'js-cookie';


export const api = axios.create({
    baseURL: `https://${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to headers if it exists
api.interceptors.request.use((config) => {
    const token = Cookies.get('access');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = async (username: string, password: string) => {
    const response = await api.post('/api/users/login/', {
        username,
        password,
    });
    return response;
};

export const register = async (username: string, password: string, email: string) => {
    return api.post('/api/users/register/', {
        username,
        password,
        email,
    });
};



export const logout = () => {
    Cookies.remove('access');
    Cookies.remove('refresh');
};


