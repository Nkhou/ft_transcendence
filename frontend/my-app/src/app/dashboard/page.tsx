"use client";
import React, { useEffect, useState } from 'react';
import "./style.css";
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';
import Dashboard from "@/app/components/Dashboard/Dashboard";
import { api2 } from '../utils/auth';
import { Spinner } from '@nextui-org/react';

const App: React.FC = () => {
  const router = useRouter();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null); 
  useEffect(() => {
    const token = Cookie.get('access');
    const refresh = Cookie.get('refresh');
    const checkTokenValidity = async () => {
      if (!token || !refresh) {
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await api2.get('api/users/validate-token/');
        if (response.data.message === 'Invalid token') {
          const refreshResponse = await api2.post('api/users/refresh-token/');
          if (refreshResponse.data.message === 'Token refreshed') {
            setIsTokenValid(true);
          } else {
            Cookie.remove('access');
            Cookie.remove('refresh');
            setIsTokenValid(false);
          }
        } else {
          setIsTokenValid(true);
        }
      } catch (error: any) {
        Cookie.remove('access');
        Cookie.remove('refresh');
        setIsTokenValid(false);
      }
    };

    checkTokenValidity();
  }, []);

  useEffect(() => {
    if (isTokenValid === false) {
      router.push('/login-signup');
    }
  }, [isTokenValid, router]);

  if (isTokenValid === null) {
    return (
     <div className="flex items-center justify-center h-screen w-screen">
       <Spinner/>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-auto lg:overflow-hidden overflow-x-hidden bg-black">
      <div className="flex-1 p-5 transition-all duration-300 ease-in-out lg:pl-4 z-10 relative">
        <Dashboard />
      </div>
    </div>
  );
};

export default App;