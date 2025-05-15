import React from "react";
import Gamehistory from "./Gamehistory";
import GameRank from "../game/gameRank";
import { useTranslation } from "react-i18next";
import { api } from "@/app/services/api";
import { useState , useEffect} from "react";
import Cookies from "js-cookie";
import MatchStatsChart from "@/app/components/game/radar";
import Image from "next/image";

interface DashboardComponentProps {
  Dashboard: boolean;
  setDashboard: (value: boolean) => void;
  statistics: number[];
}

// const game = [
//   { username: "Demnati", : 1, level: 10 },
//   { username: "Khalid", id: 2, level: 9 },
//   { username: "Youssef", id: 3, level: 8 },
//   { username: "Hassan", id: 4, level: 7 },

// ];


const OtherDashboard: React.FC<DashboardComponentProps> = ({
  Dashboard,
  setDashboard,
  statistics,
}) => {
  const { t } = useTranslation();
  const [gameHistory, setGameHistory] = useState([]);
  const [gameRank, setGameRank] = useState([]);

  
  useEffect(() => {
    const token = Cookies.get('access');
    const fetchGameHistory = async () => {
      try {
        const response = await api.get('/api/users/game-history/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGameHistory(response.data);
      } catch (error: any) {
        console.clear();
      }
    };
    const fetchGameRank = async () => {
      try {
        const response = await api.get('/api/users/global-ranking/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          setGameRank(response.data);
        }
      } catch (error: any) {
        console.clear();
      }
    }

    fetchGameRank();
    fetchGameHistory();
  }, []);

  return (
    <>

      {Dashboard && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-100 z-[9999] flex items-center justify-center">
          {/* Container */}
          <div className="w-[95%] lg:w-[80%] h-[95%] bg-opacity-100 rounded-lg bg-black shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
              <h1 className="text-3xl lg:text-5xl font-[Roquila] text-gradient2">
                {t('Stats.GameDashboard')}
              </h1>
              <button
                onClick={() => setDashboard(false)}
                className="p-2 text-xl lg:text-2xl font-[Roquila] text-gradient2 hover:underline"
              >
                <Image
                  src="/icons/close.svg"
                  alt="close"
                  width={30}
                  height={30}/>
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-[85%]">
              {/* Stats Section */}
              <div className="bg-black bg-opacity-60 rounded-md p-4 overflow-auto h-full">
                <h2 className="text-xl lg:text-2xl font-[walo] text-gradient">
                  {t("stats")}
                </h2>
                {/* Example Stats */}
                <div className='w-[30em] h-[30em]'>
                  <MatchStatsChart
                    matchesWon={statistics[1]}
                    matchesLost={statistics[2]}
                    matchesPlayed={statistics[0]}
                  />
                    </div>
              </div>

              {/* Game History Section */}
              <div className="bg-black bg-opacity-60 rounded-md p-4 overflow-auto h-full">
                <h2 className="text-xl lg:text-2xl font-[walo] text-gradient">
                  {t("gameHistory")}
                </h2>
                <Gamehistory gameHistory={gameHistory} />
              </div>

              {/* Game Rank Section */}
              <div className="col-span-1 lg:col-span-2 bg-black bg-opacity-60 rounded-md p-4 overflow-auto h-full">
                <h2 className="text-xl lg:text-2xl font-[walo] text-gradient">
                  {t("globalRank")}
                </h2>
                <GameRank global={gameRank} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OtherDashboard;
