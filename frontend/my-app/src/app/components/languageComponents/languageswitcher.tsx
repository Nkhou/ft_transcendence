import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Vortex } from '../login-signup/back';

interface LanguageSwitcherProps {
  enablelanguage: (value: boolean) => void;
}

const LanguageSwitcher: React.FC <LanguageSwitcherProps> = ({enablelanguage }) => {
  const { i18n } = useTranslation();
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const languages = [
    { code: 'en', emoji: '🇬🇧' ,text : "English"},
    { code: 'fr', emoji: '🇫🇷' ,text : "Francais"},
    { code: 'ar', emoji: '🇦🇪' ,text : "العربية"},
    { code: 'ch', emoji: '🇨🇳' ,text : "中文"},
    { code: 'jp', emoji: '🇯🇵' ,text : "日本語"},

    
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  };

  const getCurrentLanguageIndex = () => {
    const currentLanguage = localStorage.getItem('language');
    if (currentLanguage) {
      const index = languages.findIndex((lang) => lang.code === currentLanguage);
      if (index !== -1) {
        setCurrentLanguageIndex(index);
      }
    }
  };  


  const toggleLanguage = () => {
    getCurrentLanguageIndex();
    const nextIndex = (currentLanguageIndex + 1) % languages.length;
    const nextLanguage = languages[nextIndex];
    setCurrentLanguageIndex(nextIndex);
    changeLanguage(nextLanguage.code);
    localStorage.setItem('language', nextLanguage.code);
  };

  return (<>
    <div className='bg-gray-900 z-[9999999] fixed w-screen h-screen flex flex-col gap-5 items-center justify-center'>
      <h1 className='text-2xl lg:text-5xl font-[walo]'> {languages[currentLanguageIndex].text}</h1>
        <button onClick={toggleLanguage} className='text-9xl'>
          {languages[currentLanguageIndex].emoji}
        </button>
      <div>

      </div>
      <>
      <button className="absolute top-4 right-4 z-50 p-2 shadow-md text-white " onClick={()=>{enablelanguage(false)}}>
       <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
      </button>
      </>
    </div>
  </>
  );
};

export default LanguageSwitcher;
