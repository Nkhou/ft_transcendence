'use client';

import { ReactNode, useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './globals.css';
import { I18nextProvider } from 'react-i18next';
import Cookie from 'js-cookie';
import i18n from '@/app/components/languageComponents/i18';
import Spinner from '@/app/components/styles/loader'; 
import { useAuth } from '@/app/utils/auth';

import {api} from '@/app/services/api';

import {Sidebars} from '@/app/components/sidebars/Side';


export default function RootLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading ,isAuthenticated } = useAuth(); 



  useEffect(() => {
    if (!loading) {
      const spinnerTimeout = setTimeout(() => {
        setShowSpinner(false); 
      }, 1000); 
      
      return () => clearTimeout(spinnerTimeout);
    }
  }, [loading]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const updateLastActivity = async (pathname: string) => {
    try {
      if(!Cookie.get('access')) return;
        const response = await api.post('/api/users/update-last-activity/', {
          headers :
          {
            Authorization: `Bearer ${Cookie.get('access')}`
          }
        })

    } catch (error) {
    }
  };
  
  useEffect(() => 
    {
    const interval = setInterval(updateLastActivity, 3000);
    return () => clearInterval(interval);
  }, []);



  const handleLogout = () => {
    const request = async () => {
      try {
        const token = Cookie.get('access');
        const response = await api.post('/api/users/logout/', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error: any) {
        console.clear();
      }
    }
    request();
    Cookie.remove('access');
    Cookie.remove('refresh');
    router.push('/login-signup');
  };

  const currentPage = pathname.split('/').pop() || '';
  const shouldRenderSidebar = ['/chat', '/game','/tournament'].includes(pathname) ;

  if (loading || showSpinner) {
    return (
      <html lang="en">
        <head>
          <title>{`ft_transcendence ${currentPage}`}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <Spinner />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>{`ft_transcendence ${currentPage}`}</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={<Spinner />}>
          {shouldRenderSidebar ? (
            <div className="relative flex h-screen lg:overflow-hidden">
              <Sidebars
                label={user?.username}
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
                currentPath={currentPage}
                online={true}
                User={user}
                logout={handleLogout}
                handleDashboardToggle={() => {}}
                />
              <main className="flex-1">{children}</main>
            </div>
          ) : (
            <main className="w-screen h-screen">{children}</main>
          )}
          </Suspense>
        </I18nextProvider>
      </body>
    </html>
  );
}
