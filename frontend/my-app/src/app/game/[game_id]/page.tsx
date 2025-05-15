
"use client";
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import PingPongGame from '@/app/components/game/RemotePingPong';
const GameRoom: React.FC = () => {
  const { game_id } = useParams();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [gameData, setGameData] = useState<any>(null); 
  let numericGameId  : number = 0;
  
  useEffect(() => {
    if (Array.isArray(game_id)) {
      return;
    }
    
    if (game_id) {
      numericGameId= parseInt(game_id, 10);
      const token = Cookie.get('access');
    }
  }, [game_id]);

  return (
    <div className='bg-black text-white'>
      <PingPongGame Gameid={parseInt(game_id as string, 10)} GameData={gameData}/>
      <h1>Game Room {game_id}</h1>
      
    </div>
  );
};

export default GameRoom;
