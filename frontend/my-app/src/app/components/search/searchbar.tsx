"use client";
import { PlaceholdersAndVanishInput } from "./impuut";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
interface SearchComponentProps {

  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const SearchComponent: React.FC<SearchComponentProps> = ({handleSearchChange}) => {
  const { t } = useTranslation();

 

 
  const placeholders = [

    t('search.Search'),
      t('search.find'),
      t('search.Explore'),
      t('search.Add'),
   
  ];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
   <div className="flex flex-col items-center justify-center bg-transparent  font-[abelhid] ">
    
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleSearchChange}
        onSubmit={onSubmit}
        
      />
      
    </div>
  );
};

export default SearchComponent;





