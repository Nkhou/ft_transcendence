"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Cookie from 'js-cookie';
import PingPongGame from '@/app/components/game/tournamentPingPong';
import { GameProps } from '@/app/utils/userinterface';
import {useTranslation} from 'react-i18next';
import { api } from '@/app/services/api';
interface ArrayAlias {
  alias: string[];
}
const BracketRoom: React.FC<ArrayAlias> = (alias: ArrayAlias) => {
  const { t } = useTranslation();
  const router = useRouter();
  const token = Cookie.get('access');
  const [start, setStart] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [winner1, setWinner1] = useState<string>('');
  const [winner2, setWinner2] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [round, setRound] = useState<number>(0);
  const [currentGame, setCurrentGame] = useState<GameProps | null>(null);

  useEffect(() => {
    if (token) {
      if (alias) {
        setParticipants(alias.alias);
      }
      else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }, [token]);

  
  const updateStatus = async (status: string) => {
    try {
      await api.put("/api/users/update-status/", { status },
        {
          headers:
          {
            Authorization: `Bearer ${Cookie.get("access")}`,
          },
        });
    }
    catch (error) {
      console.clear();
    }
  }


  const createGameForRound = (roundNumber: number): GameProps => {
    switch (roundNumber) {
      case 1:
        return {
          status: 'pending',
          players: [
            { alias: participants[0], score: 0, is_winner: false },
            { alias: participants[2], score: 0, is_winner: false }
          ],
          winnerInGame: '',
          score: '',
          setGame: handleSetGame
        };
      case 2:
        return {
          status: 'pending',
          players: [
            { alias: participants[1], score: 0, is_winner: false },
            { alias: participants[3], score: 0, is_winner: false }
          ],
          winnerInGame: '',
          score: '',
          setGame: handleSetGame
        };
      case 3:
        return {
          status: 'pending',
          players: [
            { alias: winner1, score: 0, is_winner: false },
            { alias: winner2, score: 0, is_winner: false }
          ],
          winnerInGame: '',
          score: '',
          setGame: handleSetGame
        };
      default:
        throw new Error('Invalid round number');
    }
  };
 
  const handleStartTournament = () => {

    updateStatus('In Tournament');
    if (participants.length === 4) {
      if (round === 0) {
        setRound(1);
        setCurrentGame(createGameForRound(1));
        setStart(true);
      } else if (round === 1 && winner1) {
        setRound(2);
        setCurrentGame(createGameForRound(2));
        setStart(true);
      } else if (round === 2 && winner1 && winner2) {
        setRound(3);
        setCurrentGame(createGameForRound(3));
        setStart(true);
      }
    }
  };
  
  const handleSetGame = (game: GameProps) => {
    if (game.status === 'completed') {
      const winnerAlias = game.players[0].is_winner 
      ? game.players[0].alias 
      : game.players[1].alias;
      
      if (round === 1) {
        setWinner1(winnerAlias);
      } else if (round === 2) {
        setWinner2(winnerAlias);
      } else if (round === 3) {
        setWinner(winnerAlias);
        updateStatus('available');
      }
      
      setStart(false);
      setCurrentGame(null);
    }
  };

  const renderParticipantSlot = (index: number) => {
    let participantSlot;
    let isRendered = false;

    if (index === 4 && winner1) {
      participantSlot = winner1;
      isRendered = true;
    } else if (index === 5 && winner2) {
      participantSlot = winner2;
      isRendered = true;
    } else if (index < 4) {
      participantSlot = participants[index];
      isRendered = true;
    }

 


    return (
      <div
        key={index}
        className='relative w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-white/20 rounded-full border-2 border-fuchsia-400 flex items-center justify-center'
      >
        {isRendered && participantSlot && (
          <span className='absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs sm:text-sm md:text-base font-[walo] rounded-full'>
            {participantSlot}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className='h-screen w-screen fixed inset-0 bg-black flex items-center justify-center z-50 p-4'>
      <div className='rounded-xl p-6 md:p-10'>
        <h2 className='absolute top-10 left-1/2 transform -translate-x-1/2 font-[walo] text-xl sm:text-2xl md:text-3xl text-gradient2 tracking-lg mb-4 text-center z-[9999999]'>
          {
            !(start && currentGame) &&(
              <>
              {t('tournament.localtournament')}
              </>
            )
          }
        </h2>
        
        {winner ? (
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-8 rounded-xl backdrop-blur-sm border border-fuchsia-500 shadow-2xl animate-fadeIn z-[99999999]'>
            <h2 className='text-3xl md:text-4xl font-[walo] text-fuchsia-500 text-center mb-4'>
              🏆 {t('tournament.champion')} 🏆
            </h2>
            <p className='text-2xl md:text-3xl font-[walo] text-white text-center mb-6'>
              {winner}
            </p>
            <div className='w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full'/>
          </div>
        ) : (
          <>
            {start && currentGame ? (
              <div className='h-screen w-screen fixed inset-0 bg-black flex items-center justify-center z-50 p-4'>
                <PingPongGame {...currentGame} 
                  setGame={handleSetGame}
                />
              </div>
            ):
            (
              <button
                onClick={handleStartTournament}
                className='absolute bottom-5 right-0 transform -translate-x-1/2 w-32 sm:w-36 md:w-40 h-8 sm:h-9 md:h-10 font-[walo] bg-fuchsia-600 rounded-lg text-sm sm:text-base text-white hover:bg-fuchsia-900 transition-colors duration-300 z-[999999999999]'
              >
                {t('tournament.start')}
              </button>
              )}
          </>
        )}
        { !(start && currentGame) && (
          <button
            onClick={() => router.push('/dashboard')}
            className='absolute bottom-5 left-[10%] transform -translate-x-1/2 w-32 sm:w-36 md:w-40 h-8 sm:h-9 md:h-10 font-[walo] bg-fuchsia-600 rounded-lg text-sm sm:text-base text-white hover:bg-fuchsia-900 transition-colors duration-300 z-[999999999999]'
          >
            {t('tournament.exit')}
          </button>
        )

        }
      </div>
      {!winner && (
      <div className='relative h-full w-full'>
        <div className='flex items-center justify-center min-h-screen w-full space-x-8 sm:space-x-40 md:space-x-60 lg:space-x-80'>
          {renderParticipantSlot(4)}
          {renderParticipantSlot(5)}
        </div>
        <div className='flex justify-between items-center absolute bottom-[20%] w-full px-4 sm:px-8 md:px-10 lg:px-20'>
          {renderParticipantSlot(2)}
          {renderParticipantSlot(3)}
        </div>
        <div className='flex justify-between items-center absolute top-[20%] w-full px-4 sm:px-8 md:px-10 lg:px-20'>
          {renderParticipantSlot(0)}
          {renderParticipantSlot(1)}
        </div>
      </div>
      )}
    </div>
  );
};

export default BracketRoom;