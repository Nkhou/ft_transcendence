
"use client";
import styles from './404.module.css';
import "@/app/dashboard/style.css";
import { useRouter } from 'next/navigation';
import {Texto }from '@/app/components/styles/Texto';
import { useEffect, useState } from 'react';

export default function Custom404() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dark') === 'true';
    }
    return false;
  });
  const router = useRouter();
  const handleGoBack = () => {
    router.push('/');
  };
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newDarkMode = !prev;
      localStorage.setItem('dark', newDarkMode.toString());
      document.body.classList.toggle('dark', newDarkMode);
      return newDarkMode;
    });

  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  return (
    <div className="flex w-screen h-screen justify-center items-center bg-white dark:bg-black text-black dark:text-white flex-col font-[abelhid]">
     
        <Texto words="404 - Page Not Found  "className=' dark:bg-black dark:text-white'  />
        <Texto words="The page you are looking for might have been removed." className={styles.description} />
        <button onClick={handleGoBack}>
          <Texto words="Go back to Home" className={styles.buttonText} />
        </button>
    </div>
  );
}
