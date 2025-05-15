"use client";
import { ReactNode } from 'react';


export default function TournamentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      
    <div className="w-screen h-screen bg-transparent dark:text-white ">
      {children}
    </div>
    </>
  );
}