import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { getUserData } from '@/app/chat/chatPr'; 
import { User } from '@/app/utils/userinterface';
import {api} from '@/app/services/api';


interface AuthResult {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
export const api2 = axios.create({
  baseURL: `https://${process.env.NEXT_PUBLIC_API_BASE_URL}/`, 
  withCredentials: true,
});


export const useAuth = (): AuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const setupInterceptor = () => {
      api2.interceptors.response.use(
        (response :any ) => {
          return response;
        },
        async (error :any ) => {
          if (error.response) {
            if (error.response.status === 500) {
              Cookies.remove('access');
              router.push('/login-signup');
            }
          } else {
            console.clear();
            Cookies.remove('access');
            router.push('/login-signup');
          }

          return Promise.reject(error);
        }
      );
    };

    setupInterceptor();

    return () => {
      api2.interceptors.response.eject(setupInterceptor as any); // Optional cleanup
    };
  }, [router]);
  
  const checkTokenValidity = async () => {
    if(!Cookies.get('refresh')) {
      return false;
    }
    try {
      const response = await api2.get('api/users/validate-token/');
      if(!Cookies.get('refresh')) {
        return false;
      }
      if (response.data.message === 'Invalid token') {
        const refresh = await api2.post('api/users/refresh-token/', {
        });
        if (refresh.data.message === 'Token refreshed')
          return true;
        Cookies.remove('access');
        Cookies.remove('session');
        Cookies.remove('refresh');
        router.push('/login-signup');
        return false;
      }
      return true;
    } catch (error : any) {    
      return false;
    }
  };
  
  const fetchUserData = async () => {
    try {
      if (!Cookies.get('access')) {
      const data = await getUserData();
      setUser(data.user);
      setIsAuthenticated(true);
      }
    } catch (error) {
      console.clear();
      setIsAuthenticated(false);
    }
  };
  
  const checkAuth = async () => {
    setLoading(true);
    
    const isValidToken = await checkTokenValidity();
    if (!isValidToken) {
      setIsAuthenticated(false);
     
      if ((pathname !== '/login-signup' && pathname !== '/' && pathname !== '/otp' && pathname !== '/forgotten' && pathname.includes('/forgotten/reset') === false)) {
        Cookies.remove('access');
        Cookies.remove('session');
        Cookies.remove('refresh');
        router.push('/login-signup'); 
      }
    } else {
      setIsAuthenticated(true);

      if(pathname === '/chat'  || pathname == '/game' || pathname == '/tournament') {
        
        await fetchUserData(); 
      }
      
    }
    setLoading(false);
  };
  useEffect(() => {

    checkAuth();
  }, [pathname, router]);

  return { user, isAuthenticated, loading };
};
