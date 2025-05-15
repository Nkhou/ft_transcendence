
"use client";
import { ReactNode } from 'react';
import {Vortex} from '@/app/components/login-signup/back'



export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" absolute  w-screen h-screen">
       <div className="fixed inset-0 w-screen h-screen z-[-1]">

        <Vortex
          particleCount={100}
          rangeSpeed={10}
          baseHue={930}
          backgroundColor='rgba(0,0,0,0.5)'
          baseRadius={1}

        />
        </div>
     
        {children}
    </div>
  );
}
