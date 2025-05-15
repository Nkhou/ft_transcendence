"use client";
import React from 'react'
import { useState } from 'react';
import { User } from "@/app/utils/userinterface";
import Cookie from "js-cookie";
import { useEffect, useRef } from 'react';
import {api} from "@/app/services/api";

interface Props
{
  user: User;
  gameId:string | undefined;
}



const UserDetails: React.FC<Props> = ({ user ,gameId}) => {
  const profilePictureUrl = user.profile_picture
    ? user.profile_picture.startsWith('https') 
      ? user.profile_picture
      :  `https://${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profile_picture}`
    : '/avatar.jpg'; // Default image

  return (
    <>

    <div className="flex flex-col items-center p-4 bg-neutral-600 rounded-lg shadow-md space-y-2 w-[30em] ">
      <img
        src={profilePictureUrl}
        
        alt={`${user.username}'s profile picture`}
        className="w-[10em] h-[10em] rounded-full border-2 border-purple-900"
        />
      <div className="text-8xl font-light text-gradient2 font-[Roquila] ">{user.username}</div>
      <div className="text-purple-500 text-lg font-[walo] text-gradient2">Level: {user.level}</div>
    </div>
        </>
  );
}
const getDataPlayer = async (player: string) => 
    {
      const token = Cookie.get("access");
      if (!token) 
      {
        return;
      }
      try
      {
        const response = await api.get(`/api/users/userData/${player}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      }
      catch (error)
      {
        console.clear();
      }
    }


const Pregame = () => {
    const token = Cookie.get("access");
    const [player1, setPlayer1] = useState<User | null>(null);
    const [player2, setPlayer2] = useState<User | null>(null);
    const socket = useRef<WebSocket | null>(null);
    let GameId =  Cookie.get("game_id")?.toString();


    if (!token || !GameId) {
      return;
      }
  
    const SOCKET_URL = `wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/game/${GameId}/?token=${token}`;
    
    
    useEffect(() => {
      socket.current = new WebSocket(SOCKET_URL);
    
      socket.current.onopen = () => 
      {
        socket.current?.send(JSON.stringify({ action: 'get_game_state' }));
      };
    
     
    
      socket.current.onmessage = async (event :any) => {
        const message = JSON.parse(event.data);
    
        if ( message.type === 'game_state' ) 
        {
          if(message.game_state.player1 !== undefined)
          {
            const player1 = await getDataPlayer(message.game_state.player1);
            setPlayer1(player1);
          }
          if(message.game_state.player2 !== undefined)
          {
            const player2 = await getDataPlayer(message.game_state.player2);
            setPlayer2(player2);
          }
        }
    };
    
    
      return () => {
        socket.current?.close();
      };
    }, []);
  return (
    <div>
        <div className="flex items-center justify-center space-x-12 p-6 bg-neutral-800 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
      {player1 && <UserDetails user={player1} gameId={GameId} />}
     </div>
     <div className="text-4xl font-extrabold text-red-600 font-[abelhid]">VS</div>
      <div className="flex flex-col items-center">
      {player2 && <UserDetails user={player2} gameId={GameId} />}
    </div>
    </div>
    {/* button */}
    <div className="flex items-center justify-center p-4 bg-neutral-800  shadow-lg">
      <button className="text-2xl font-extrabold text-red-600 font-[walo]">Exit</button>
    </div>

      
    </div>
  )
}

export default Pregame
