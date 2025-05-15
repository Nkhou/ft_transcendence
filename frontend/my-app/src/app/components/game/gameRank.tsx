import React from 'react'


interface Game {
    global: {
        rank: number;
        username: string;
        level: number;
    }[];
}

const gameRank: React.FC<Game> = ({ global }) => {
    return (
        <div className="flex-1 h-[85%] dark:bg-opacity-40 md:h-[85%] lg:h-[85%] rounded-lg p-4 overflow-auto">
            <div className="overflow-auto w-full">
                <ul className="space-y-3">
                    {global.map((game, index) => (
                        <li
                            key={index}
                            className={`p-4 rounded-lg shadow-sm flex items-center justify-between font-[hossine]
                                bg-gradient-to-r-to-b from-purple-900   via-transparent  to-transparent
                                relative overflow-hidden transition-all duration-500 ease-in-out`}
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r  opacity-50"></span>
                            <div className="text-sm md:text-base relative z-10">
                                <div className="text-xs md:text-2xl text-blue-500 font-[walo]">#{game.rank}<span className="text-white font-semibold">  {game.username}</span></div>
                                
                                <div className="text-xs md:text-sm text-gray-500 font-[hossine]">{game.level}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
  )
}

export default gameRank
