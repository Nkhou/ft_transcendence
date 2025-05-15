import React from 'react';
import { useTranslation } from 'react-i18next';

interface Game {
  gameHistory: {
    date: string;
    opponent: {
      id: number;
      username: string;
    };
    formatted_time: string;
    timestamp: string;
    result: string;
  }[];
}

const Gamehistory: React.FC<Game> = ({ gameHistory }) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 h-[85%] dark:bg-opacity-40 md:h-[85%] lg:h-[85%] rounded-lg p-4 overflow-auto">
      <div className="overflow-auto w-full">
        <ul className="space-y-3">
          {gameHistory.map((game, index) => (
            <li
              key={index}
              className={`p-4 rounded-lg shadow-sm flex items-center justify-between font-[abelhid]
                ${game.result === 'won' 
                  ? 'bg-gradient-to-r-to-b from-pink-400 via-transparent to-transparent' 
                  : 'bg-gradient-to-r-to-b from-pink-800 via-transparent to-transparent'}
                relative overflow-hidden transition-all duration-500 ease-in-out`}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r opacity-50"></span>
              <div className="text-sm md:text-base relative z-10">
                {/* Access opponent details from the opponent object */}
                <div className="text-white font-semibold">{game.opponent.username}</div>
                <div className="text-xs md:text-sm text-gray-500 font-[Montserrat]"> {game.formatted_time}</div>
              </div>
              <div className={`font-bold relative z-10 ${game.result === 'won' ? 'text-pink-800' : 'text-purple-900'}`}>
              {game.result === 'won' ? t('gameHisto.Win') : t('gameHisto.Lose')}
              </div>
              
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Gamehistory;
