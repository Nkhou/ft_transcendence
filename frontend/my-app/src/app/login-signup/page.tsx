"use client";
import React, { useState, useEffect } from 'react';
import "@/app/login-signup/login.css";
import { Vortex } from '../components/login-signup/back';
import SignUp from '../components/login-signup/login';
import { Texto } from '../components/styles/Texto';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const App: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen overflow-hidden bg-black">
            <Vortex 
                particleCount={500}
                baseRadius={0.2}
                baseHue={600}
                baseSpeed={50} 
                className='vortex' 
                backgroundColor='rgba(6, 0, 9, 0.2)' 
            />
            <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center w-[50%]">
                <div className="font-[hossine] text-purple-700 text-7xl md:text-8xl lg:text-9xl" >
                    <Texto words="Ping Pong" />
                </div>
                <SignUp /> 
            </div>
        </div>
    );
};

export default App;
