import React, { useState } from 'react';
import Image from 'next/image';
import Settings from './settings';

interface SettingsComponentProps {
    settings: boolean;
    setSettings: (value: boolean) => void;
}
const SettingsComponent: React.FC<SettingsComponentProps> = ({ settings, setSettings }) => {
  return (
    <>
      

      {settings && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 z-[999999999999999]">
          <Settings setSettings={setSettings}/>
          
          
        </div>
      )}
    </>
    );
};

export default SettingsComponent;
