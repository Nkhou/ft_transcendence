import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Cookie from 'js-cookie';
import { useTranslation } from 'react-i18next';

import BracketRoom from './localTournament';
const StartTournament: React.FC = () => {
    const token = Cookie.get('access');
    const router = useRouter();
    const [alias, setAlias] = useState<string[]>(Array(4).fill(''));
    const [localTournament, setLocalTournament] = useState<boolean>(false);
    const { t } = useTranslation();


    useEffect(() => {
        if (!token) {
            router.push('/dashboard');
        }
    }, [token]);
    const handleCreateHosttournament = () => {
        if (alias.some((a:any) => a.trim() === '')) {

            return;
        }
        const uniqueAlias = new Set(alias.map((a:any) => a.trim().toLowerCase()));
        if (uniqueAlias.size !== alias.length) {
            return;
        }
        setLocalTournament(true);

    }

    const handleExit = () => {
        router.push('/dashboard');
    };
    const handleAliasChange = (index: number, value: string) => {
        if (value.length > 7) {
            return;
        }
        setAlias((prev: string[]) => {
            const newAliases = [...prev];
            newAliases[index] = value;
            return newAliases;
        });
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black">
        <div className="absolute top-0 left-0 right-0 text-center pt-8">
            <h2 className="font-[walo] text-[2rem] lg:text-[4rem] text-gradient3 tracking-lg">
              {t('tournament.localtournament')}
            </h2>
        </div>
        <button
            onClick={handleExit}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
            <X size={25} />
        </button>
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="bg-violet-500 bg-opacity-20 rounded-xl w-full max-w-xl p-10 md:p-20 relative space-y-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="relative">
                        <input
                            type="text"
                            placeholder={t('tournament.enteryouralias')}
                            value={alias[index]}
                            onChange={(e) => handleAliasChange(index, e.target.value)}
                            className="w-full px-4 py-4 bg-white/10 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 font-[abelhid]"
                        />
                    </div>
                ))}
                <button
                    className="font-[abelhid] absolute bottom-4 right-5 text-white hover:text-gray-300"
                    onClick={handleCreateHosttournament}
                >
                    {t('tournament.enter')}
                </button>
                {localTournament && <BracketRoom alias={alias} />}
            </div>
        </div>
    </div>
    );
};

export default StartTournament;