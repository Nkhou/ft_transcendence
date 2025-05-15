"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { api } from "@/app/services/api";
import Cookie from "js-cookie";
import { User } from "@/app/utils/userinterface";
import Background from "../components/Background/Background";
import PingPongGame from "../components/game/pingPong";
import Pregame from "../components/game/pregame";
import {useRouter} from "next/navigation";

const GamePage: React.FC = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [LocalGame, setLocalGame] = useState<boolean>(false);
  const router = useRouter();

  const GameId = Cookie.get("game_id");

  useEffect(() => {

    if(GameId){
      router.push(`/game/${GameId}`);
    }
  }, []);
  if(GameId){
    return <div></div>
  }



  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-700 to-pink-500  text-white bg-black z-[9999999999]">
      <div className="flex flex-col items-center justify-center h-full bg-transparent">
        <h1 className="text-4xl text-white">{t("game.game")}</h1>
        <>
        </>



        {LocalGame ? (
          <PingPongGame />
        ) : (
          <>
          <div className="w-screen h-screen bg-gradient-to-br from-purple-700 to-pink-500 flex items-center justify-center gap-5 text-white font-[walo]">
            <button className="bg-purple-900 hover:bg-purple-700 transition duration-300 w-[10em] h-[2em] font-semibold rounded-lg shadow-lg" onClick={()=>{setLocalGame(true)}}>
              {t('game.local')}
            </button>
          </div>
          </>
        )}




      </div>
    </div>
  );
};

export default GamePage;