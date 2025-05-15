"use client";
import React, { useEffect, useState } from 'react';
import Background from '@/app/components/Background/Background';
import StartTournament from '../components/tournament/startTournament';



const App: React.FC = () => {
  
  return (

      <div className="flex h-screen w-screen overflow-auto lg:overflow-hidden overflow-x-hidden bg-transparent ">
         <Background  />
          <div className="flex-1 p-5 transition-all duration-300 ease-in-out lg:pl-4 z-10 relative">
              <StartTournament  />
          </div>
      </div>

  );
};

export default App;

