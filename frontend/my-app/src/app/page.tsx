"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// import { ThemeProvider } from '@/app/context/ThemeContext';

export default function Page() {
  const router = useRouter();

  const handleClick = () => {
    const token = Cookies.get('access');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login-signup');
    }
  };

  return (
<>

<div className="relative w-screen h-screen bg-black">
  <video autoPlay loop muted src="aa.mp4" className="absolute inset-0 w-full h-full object-cover opacity-[0.5]" />
  <div className="relative flex flex-col items-center justify-center z-10  w-full h-full ">
    <h1 className='font-[hossine] text-purple-600 sm:text-[4rem] md:text-[4rem] lg:text-[9rem] text-[4rem]'>PING PONG</h1>
    <p className='font-[hossine] text-pink-100 sm:text-[1.5rem] md:text-[1.5rem] lg:text-[3rem] text-[1.5rem]'> THE ULTIMATE GAME FOR ALL </p>
    <button
  onClick={handleClick}
  className="px-[5rem] lg:px-[10rem] py-3 my-4 bg-purple-600 bg-opacity-30 text-white font-bold font-[bilala] hover:bg-purple-200 hover:text-black transition-colors duration-300"
>
  PLAY
</button>
  </div>
</div>


      
      
</>

  );
}
