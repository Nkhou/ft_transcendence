"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { contourDensity } from "d3";
import Pregame from "./pregame";
import Table from "./Table";
import { useTranslation } from "react-i18next";









type NotificationProps = {
  message: string;
  type: "success" | "error" | "info";
};

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  return (
    <div className="fixed w-screen h-screen top-0 left-0 flex items-center justify-center z-[999999999999999] bg-black ">
      {type === 'success' ? (
        <div className="text-white text-6xl p-6 rounded-lg shadow-lg text-center">
          <h1 className="font-[walo] text-8xl">{message}</h1>
        </div>
      ) : type === 'error' ? (
        <div className="text-white text-6xl p-6 rounded-lg text-center bg-black ">
          <h1 className="font-[walo] text-8xl">{message}</h1>
        </div>
      ) : (
        <div className="text-blue-400 text-6xl p-6 rounded-lg shadow-lg text-center">
          <h1 className="font-[walo] text-8xl">{message}</h1>
        </div>
      )}
    </div>
  );
};




interface GameProps {
  Gameid: number;
  GameData?: any;
}

const MAX_SCORE = 10;

const get_user = async (token: string) => {
  const response = await api.get("/api/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

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


const Paddle = React.forwardRef<THREE.Mesh, { position: [number, number, number]; color: string }>(
  ({ position, color }, ref) => (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.8, 0.1, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
);


const Ball = React.forwardRef<THREE.Mesh, any>(
  ({ playerPaddleRef, opponentPaddleRef, onScore, isMatchActive, Currentuser, Player2, websocket }, ref) => {
    const internalRef = useRef<THREE.Mesh>(null!);
    const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
    const isPlayer2 = Currentuser.username === Player2;

    React.useImperativeHandle(ref, () => internalRef.current);

    useEffect(() => {
      if (!websocket.current) return;

      const handleWebSocketMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.command === "ball_update") {
          const positionKey = isPlayer2 ? "position_player2" : "position_player1";
          const [x, y, z] = data.message[positionKey];
          targetPosition.current.set(x, y, z);
          onScore(data.message.score_player1, data.message.score_player2);
        }
      };

      websocket.current.addEventListener("message", handleWebSocketMessage);

      return () => {
        websocket.current?.removeEventListener("message", handleWebSocketMessage);
      };
    }, [isPlayer2, websocket, onScore]);

    useFrame(() => {
      if (internalRef.current) {
        internalRef.current.position.set(targetPosition.current.x, targetPosition.current.y, targetPosition.current.z);
      }
    });

    return (
      <mesh ref={internalRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
  }
);





const PingPongGame: React.FC<GameProps> = ({ Gameid }) => {
  const LeftplayerpaddleRef = useRef<THREE.Mesh>(null!);
  const RightplayerPaddleRef = useRef<THREE.Mesh>(null!);
  const [positionPlayerLeft, setPositionPlayerLeft] = useState(0);
  const ballRef = useRef<THREE.Mesh>(null!);

  const [positionPlayerRight, setPositionPlayerRight] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isMatchReady, setIsMatchReady] = useState(false);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");
  const [AllowedToPlay, setAllowedToPlay] = useState(true);
  const token = Cookie.get("access");
  const websocket = useRef<WebSocket | null>(null);
  const [Currentuser, setCurrentuser] = useState<any>(null);
  const router = useRouter();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const [tableColor, setTableColor] = useState("#00FF00");
  const [paddleColor, setPaddleColor] = useState("#FF0000");
  const game_id = Cookie.get("game_id");
  const [game_notfound, setGame_notfound] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!game_id) {
      setGame_notfound(true);
    }
  }, [game_id]);


  useEffect(() => {
    if (!token) {
      return;
    }
    if (Currentuser)
      return;
    get_user(token).then((user) => {
      setCurrentuser(user);
    });
  }, [Currentuser]);

  useEffect(() => {
    if (!token || !Gameid) {
      setGame_notfound(true);
      return;
    }

    websocket.current = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/game/${Gameid}/?token=${token}`);

    websocket.current.onopen = () => {
      websocket.current?.send(JSON.stringify({ action: "get_game_state" }));
    };

    websocket.current.onmessage = async (event: any) => {
      const data = JSON.parse(event.data);
    
      if (data.game_state?.state === "ended") {
        Cookie.remove("game_id");
        setGame_notfound(true);
        router.push("/game");
      }
    
      if (data.type === "game_state") {
        setPlayer1(data.game_state.player1);
        setPlayer2(data.game_state.player2);
        
        setPlayer1Score(data.game_state.score_player1);
        setPlayer2Score(data.game_state.score_player2);
        
        const current_user = await get_user(token);
        if (
          current_user.username !== data.game_state.player1 &&
          current_user.username !== data.game_state.player2
        ) {
          setAllowedToPlay(false);
        }
      }
      
      if (data.command === "game_started") {
        updateStatus('playing');
        setIsMatchReady(true);
        setIsMatchActive(true);
        setPlayer1Score(0);
        setPlayer2Score(0);
      }
    
      if (data.command === "paddle_update") {
        if (data.message.paddle === "opponent") {
          setPositionPlayerLeft(-data.message.position[0]);
        }
      }
    
      if (data.command === "player_disconnected") {
        updateStatus('available');
    
        const isSpectator = Currentuser && Currentuser.username !== player1 && Currentuser.username !== player2;
    
        const message = isSpectator
        ? `${data.message.winner} ${t('rgame.won')}`
        : data.message.winner === Currentuser.username
        ? t('rgame.Youwon')
        : t('rgame.Youlose');

        const type = isSpectator ? "info" : data.message.winner === Currentuser.username ? "success" : "error";
    
        setNotification({ message, type });
        if(!isSpectator)
          {

            setIsMatchActive(false);
            setIsMatchReady(false);
            Cookie.remove("game_id");
            setGame_notfound(true);
        
          }
          setTimeout(() => {
            setGame_notfound(true);
            Cookie.remove("game_id");
            router.push("/game");
          }, 3000);
        }
        };
    


      websocket.current.onclose = () => {
        updateStatus('available');
      };

      return () => {
        websocket.current?.close();
      };
    }, [Gameid, token, Currentuser]);
  useEffect(() => {
    let movementInterval: NodeJS.Timeout | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMatchActive || !isMatchReady) return;

      let newValue = positionPlayerRight;


      if (event.key === "ArrowLeft" && AllowedToPlay) {
        if (!movementInterval) {
          movementInterval = setInterval(() => {
            newValue = Math.max(newValue - 0.4, -1.5);
            if (newValue !== positionPlayerRight) {
              setPositionPlayerRight(newValue);
              if (websocket.current?.readyState === WebSocket.OPEN) {
                websocket.current.send(
                  JSON.stringify({
                    action: "update_paddle",
                    position: [newValue, 0.2, 2.5],
                  })
                );
              }
            }
          }, 16);
        }
      }

      if (event.key === "ArrowRight" && AllowedToPlay) {

        if (!movementInterval) {
          movementInterval = setInterval(() => {
            newValue = Math.min(newValue + 0.4, 1.5);
            if (newValue !== positionPlayerRight) {
              setPositionPlayerRight(newValue);
              if (websocket.current?.readyState === WebSocket.OPEN) {
                websocket.current.send(
                  JSON.stringify({
                    action: "update_paddle",
                    position: [newValue, 0.2, 2.5],
                  })
                );
              }
            }
          }, 16); 
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Stop the movement when key is released
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (movementInterval) {
          clearInterval(movementInterval);
          movementInterval = null;
        }
      }
    };

    // Add event listeners for keydown and keyup
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [positionPlayerRight, AllowedToPlay, isMatchActive, isMatchReady]);

  useEffect(() => {
    if (RightplayerPaddleRef.current) {
      LeftplayerpaddleRef.current.position.x = positionPlayerLeft;
    }
    if (LeftplayerpaddleRef.current) {
      RightplayerPaddleRef.current.position.x = positionPlayerRight;
    }
  }, [positionPlayerLeft, positionPlayerRight]);





  const handleScore = (scorer: "player1" | "player2") => {
    if (scorer === "player1") {
      setPlayer1Score((score) => (score + 1 === MAX_SCORE ? (setIsMatchActive(false), score + 1) : score + 1));
    } else {
      setPlayer2Score((score) => (score + 1 === MAX_SCORE ? (setIsMatchActive(false), score + 1) : score + 1));
    }
    // if(player1Score === MAX_SCORE || player2Score === MAX_SCORE)
    //     {
    //         websocket.current?.send(JSON.stringify({ action: "end_game", scorer }));
    //         setIsMatchReady(false);
    //         set

    //     }
  };




  const displayscore = (score_player1: number, score_player2: number) => {
    setPlayer1Score(score_player1);
    setPlayer2Score(score_player2);
    if (score_player1 === MAX_SCORE || score_player2 === MAX_SCORE) {
      updateStatus(t('chat.available')); 
      setIsMatchReady(false);
      setPlayer1Score(0);
      setPlayer2Score(0);
      setIsMatchActive(false);
      setGame_notfound(true);
      const isSpectator = Currentuser && Currentuser.username !== player1 && Currentuser.username !== player2;
      const winner = score_player1 === MAX_SCORE ? player1 : player2;
      if (winner === Currentuser.username) {
        const message = t('rgame.Youwon');
        const type = "success";
        setNotification({ message, type });
      }
      else if (isSpectator) {

        const message = `${winner} ${t('rgame.won')}`;
        const type = "info";
        setNotification({ message, type });
      }
      else {
        const message = t('rgame.Youlose');
        const type = "error";
        setNotification({ message, type });
      }
      Cookie.remove("game_id");
      setTimeout(() => {
        router.push("/game");
      }, 5000);

    }
  }

  const CustomizationUI = () => {

  
    if (game_notfound) {
      return (
        <div className="fixed w-screen h-screen top-0 left-0 flex items-center justify-center z-[999999999999999] bg-black bg-opacity-75">
          <div className="text-white text-6xl p-6 rounded-lg shadow-lg text-center font-[walo]">
            <h1 className="text-8xl">{t('rgame.gamenotfound')}</h1>
          </div>
        </div>
      );
    }
  
    return (
      <div className="w-screen h-screen fixed inset-0 z-[999999] bg-black bg-opacity-75 flex justify-center items-center">
        <div className="text-center text-white p-8 bg-neutral-800 rounded-xl shadow-lg w-full max-w-[500px]">
          <h1 className="text-4xl mb-6 font-[walo] text-6xl ">{t('rgame.Customizeyourtable')}</h1>
          <div className="mb-4">
            <label className="text-xl">{t('rgame.choseyourboardcolor')}</label>
            <input
              type="color"
              value={tableColor}
              onChange={(e) => setTableColor(e.target.value)}
              className="ml-2 w-12 h-12 border-none cursor-pointer"
            />
          </div>
  
          {/* Paddle Color Selection */}
          <div className="mb-6">
            <label className="text-xl">{t('rgame.chosepaddle')}</label>
            <input
              type="color"
              value={paddleColor}
              onChange={(e) => setPaddleColor(e.target.value)}
              className="ml-2 w-12 h-12 border-none cursor-pointer"
            />
          </div>
  
          {Currentuser && player1 === Currentuser.username && (
            <button
              onClick={() => startMatch()}
              className="bg-green-500 text-white px-6 py-3 rounded mt-4 text-xl cursor-pointer hover:bg-green-600 transition"
            >
              {t('rgame.startgame')}
            </button>
          )}
        </div>
      </div>
    );
  };
  


  const startMatch = () => {

    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({ action: "start_game" }));
    }
  };

  const isMatchOver = player1Score === MAX_SCORE || player2Score === MAX_SCORE;
  const winner = player1Score === MAX_SCORE ? player1 : player2;
  const sendstatus = () => {
    // updateStatus("Available");
    // websocket.current?.send(JSON.stringify({ action: "end_game", winner: winner }));
    // setIsMatchReady(false);
    // setPlayer1Score(0);
    // setPlayer2Score(0);
    // Cookie.remove("game_id");
  }


  return (
    <div className="w-screen h-screen bg-neutral-900 absolute overflow-hidden">
      {!isMatchReady && AllowedToPlay && !isMatchOver && (
        <CustomizationUI />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <Canvas camera={{ position: [0, 2, 5], fov: 75 }} className="bg-transparent w-screen">
        {!isMatchOver && (
          <>
            <ambientLight intensity={10} />
            <pointLight position={[40, 50, 50]} color="red" />
            <Table color={tableColor} texture={null} />


            {Currentuser && (
              <>
                <Paddle
                  ref={RightplayerPaddleRef}
                  color={paddleColor}
                  position={[positionPlayerRight, 0.2, 2.5]} />
                <Paddle
                  ref={LeftplayerpaddleRef}
                  color={paddleColor}
                  position={[positionPlayerLeft, 0.2, -2.5]} />
              </>
            )}

            {Currentuser && (
              <>
                <Paddle
                  ref={RightplayerPaddleRef}
                  color={paddleColor}
                  position={[positionPlayerRight, 0.2, 2.5]} />
                <Paddle
                  ref={LeftplayerpaddleRef}
                  color={paddleColor}
                  position={[positionPlayerLeft, 0.2, -2.5]} />
              </>
            )}


            {isMatchReady && (
              <Ball
                ref={ballRef}
                playerPaddleRef={RightplayerPaddleRef}
                opponentPaddleRef={LeftplayerpaddleRef}
                onScore={displayscore}
                isMatchActive={isMatchActive}
                Currentuser={Currentuser}
                Player2={player2}
                websocket={websocket}

              />

            )}
          </>
        )}
        <OrbitControls />
      </Canvas>
      <div className="absolute top-4 left-4 text-white flex flex-col font-[Roquila] text-3xl w-screen h-screen">
        {!AllowedToPlay && <div className="text-white">{t('rgame.spectate')}</div>}
        {!isMatchReady && !isMatchActive && AllowedToPlay && (
          <div>
            {/* <Pregame /> */}
            <h1>{t('rgame.nowplaying')} {player1} vs {player2}</h1>
          </div>
        )}
        {/* {isMatchOver && !isMatchActive && AllowedToPlay && (
          <div>
          </div>
        )} */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-4xl flex justify-between w-[300px]">
          <div>{player1}: {player1Score}</div>
          <div>{player2}: {player2Score}</div>
        </div>
      </div>
    </div>
  );
};

export default PingPongGame;

