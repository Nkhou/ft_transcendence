import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Vortex } from '../login-signup/back';

const News: React.FC = () => {
    const router = useRouter();

    const { t } = useTranslation();

    const handleGameClick = () => {
        router.push('/game');
    };

    const handleTournamentClick = () => {
        router.push('/tournament');
    };

    return (
        <div className="absolute flex-1 flex-col items-center justify-center bg-gradient-to-b from-black to-purple-900 rounded-lg overflow-hidden  h-[30vh] z-0 w-[95%] ">
            <div className="absolute top-0 left-0 w-full h-full object-cover opacity-50">
                <Vortex
                    particleCount={300}
                    baseRadius={1}
                    baseHue={900}
                    baseSpeed={121}
                    backgroundColor="rgba(6, 0, 9, 0.2)"
                    />
             
            </div>
            <div className="relative z-10 text-center text-gray-800 dark:text-gray-100 font-[abelhid] flex flex-col items-center justify-center h-full w-full">
                <h2 className="font-[walo]  text-[2rem]  lg:text-[3rem] text-gradient2 tracking-lg ">
                    {t('news.Community')}
                </h2>
                <p className=" font-[Roquila] text-[0.5rem]  lg:text-[1.2rem] font-light mb-6 max-w-[70rem] text-pink-300">
                    {t('news.description')}
                </p>
                <div className="flex space-x-4 font-[abelhid] font-bold" >
                    <button
                        className=" w-[8rem] h-[3rem]   lg:w-[10rem] lg:h-[3rem]  bg-pink-900 bg-opacity-40 text-white font-bold rounded-lg shadow-lg hover:bg-black transition-colors duration-300 text-sm md:text-xs sm:text-xs"
                        onClick={handleGameClick}
                    >
                        {t('news.play')}
                    </button>
                    <button
                        className=" w-[8rem] h-[3rem]   lg:w-[10rem] lg:h-[3rem]  bg-pink-900 bg-opacity-40 text-white font-bold rounded-lg shadow-lg hover:bg-black transition-colors duration-300 text-sm md:text-xs sm:text-xs"
                        onClick={handleTournamentClick}
                    >
                        {t('news.Tournament')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default News;
