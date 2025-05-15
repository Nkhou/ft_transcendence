"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import { api } from "@/app/services/api";
import Cookie from "js-cookie";

const MAX_SCORE = 10;

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

const Ball: React.FC<any> = ({ playerPaddleRef, opponentPaddleRef, onScore, isMatchActive, ballColor }) => {
    const { t } = useTranslation();
    const ref = useRef<THREE.Mesh>(null!);
    const velocity = useRef(new THREE.Vector3(0.020, 0, 0.06));

    useFrame(() => {
        if (!playerPaddleRef.current || !opponentPaddleRef.current || !isMatchActive) return;

        const ball = ref.current;
        const playerPaddle = playerPaddleRef.current;
        const opponentPaddle = opponentPaddleRef.current;

        ball.position.add(velocity.current);

        const tableWidth = 1.5;
        const tableLength = 3;

        if (ball.position.x >= tableWidth || ball.position.x <= -tableWidth) {
            velocity.current.x *= -1;
        }

        const checkCollision = (paddle: THREE.Mesh) => {
            const paddleBox = new THREE.Box3().setFromObject(paddle);
            const ballBox = new THREE.Box3().setFromObject(ball);
            return paddleBox.intersectsBox(ballBox);
        };

        if (checkCollision(playerPaddle)) {
            velocity.current.z = Math.abs(velocity.current.z); // Bounce back towards opponent
            velocity.current.x += (ball.position.x - playerPaddle.position.x) * 0.06;
        }
        if (checkCollision(opponentPaddle)) {
            velocity.current.z = -Math.abs(velocity.current.z); 
            velocity.current.x += (ball.position.x - opponentPaddle.position.x) * 0.06;
        }

        if (ball.position.z > tableLength) {
            onScore("player");
            resetBall("player");
        } else if (ball.position.z < -tableLength) {
            onScore("opponent");
            resetBall("opponent");
        }
    });

    const resetBall = (server: "player" | "opponent") => {
        ref.current.position.set(0, 0.2, 0);
        velocity.current.set(0.020, 0, 0.06);
    };

    return (
        <mesh ref={ref} position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color={ballColor} />
        </mesh>
    );
};

const Table: React.FC<{ color: string }> = ({ color }) => (
    <>
        <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[3, 0.2, 6]} />
            <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3, 0.2, 0.05]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </>
);

const PingPongGame = () => {
    const playerPaddleRef = useRef<THREE.Mesh>(null!);
    const opponentPaddleRef = useRef<THREE.Mesh>(null!);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [isMatchReady, setIsMatchReady] = useState(false);
    const [isMatchActive, setIsMatchActive] = useState(false);
    const [playerAlias, setPlayerAlias] = useState("");
    const [opponentAlias, setOpponentAlias] = useState("");
    const [tableColor, setTableColor] = useState("green"); // Table color state
    const [paddleColor, setPaddleColor] = useState("#f7e77c"); // Paddle color state
    const [ballColor, setBallColor] = useState("white"); // Ball color state
    const { t } = useTranslation();
    const handleResize = () => {
        const isMobile = window.innerWidth <= 768;
        const newFov = isMobile ? 80 : 70; // Adjust FOV based on screen size
        setFov(newFov);
    };

    const [fov, setFov] = useState(70);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize(); // Call initially to set the correct FOV
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isMatchReady || !isMatchActive) return;

            const speed = 1;
            const tableWidth = 1.5;

            if (playerPaddleRef.current) {
                if (event.key === "ArrowLeft") {
                    playerPaddleRef.current.position.x = Math.max(
                        -tableWidth,
                        playerPaddleRef.current.position.x - speed
                    );
                }
                if (event.key === "ArrowRight") {
                    playerPaddleRef.current.position.x = Math.min(
                        tableWidth,
                        playerPaddleRef.current.position.x + speed
                    );
                }
            }

            if (opponentPaddleRef.current) {
                if (event.key === "a") {
                    opponentPaddleRef.current.position.x = Math.max(
                        -tableWidth,
                        opponentPaddleRef.current.position.x - speed
                    );
                }
                if (event.key === "d") {
                    opponentPaddleRef.current.position.x = Math.min(
                        tableWidth,
                        opponentPaddleRef.current.position.x + speed
                    );
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMatchReady, isMatchActive]);

    const handleScore = (scorer: "player" | "opponent") => {
        if (scorer === "player") {
            setPlayerScore((score) => {
                if (score + 1 === MAX_SCORE) setIsMatchActive(false);
                return score + 1;
            });
        } else {
            setOpponentScore((score) => {
                if (score + 1 === MAX_SCORE) setIsMatchActive(false);
                return score + 1;
            });
        }
    };

    const startMatch = () => {
        if (!playerAlias || !opponentAlias) {
            alert("Both players must enter their aliases.");
            return;
        }
        updateStatus('playing');
        setIsMatchReady(true);
        setIsMatchActive(true);
        setPlayerScore(0);
        setOpponentScore(0);
    };

    const isMatchOver = playerScore === MAX_SCORE || opponentScore === MAX_SCORE;
    const winner = playerScore === MAX_SCORE ? playerAlias : opponentAlias;

    return (
        <div className="w-screen h-screen bg-neutral-900 absolute">
            <Canvas camera={{ position: [0, 2, 5], fov }} className="bg-transparent lg:w-screen w-[80%]">
                {!isMatchOver && (
                    <>
                    <ambientLight intensity={10} />
                    <pointLight position={[40, 50, 50]} color="red" />
                    <Table color={tableColor} /> {/* Pass table color */}
                    <Paddle ref={playerPaddleRef} position={[0, 0.2, -2.5]} color={paddleColor} />
                    <Paddle ref={opponentPaddleRef} position={[0, 0.2, 2.5]} color={paddleColor} />
                    {isMatchReady && (
                        <Ball
                            playerPaddleRef={playerPaddleRef}
                            opponentPaddleRef={opponentPaddleRef}
                            onScore={handleScore}
                            isMatchActive={isMatchActive}
                            ballColor={ballColor} // Pass ball color
                        />
                    )}
                    </>
                )}
                <OrbitControls />
            </Canvas>
            <div className="absolute top-4 left-4 text-white flex flex-col font-[Roquila] text-3xl ">
                {!isMatchReady && !isMatchActive && (
                 <div className="w-screen h-screen bg-transparent flex justify-center items-center p-4 fixed top-0 left-0 z-50">
                 {/* Background overlay */}
                 <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
               
                 {/* Customization Menu */}
                 <div className="flex flex-col items-center w-full max-w-[600px] gap-6 bg-gray-800 rounded-lg p-8 z-10 shadow-lg">
                   <h1 className="text-4xl text-white font-bold"></h1>
               
                   {/* Board Color Selection */}
                   <div className="flex flex-col items-center gap-4 w-full">
                     <h2 className="text-2xl text-white">{t('localgame.choseyourboardcolor')}</h2>
                     <input
                       type="color"
                       value={tableColor}
                       onChange={(e) => setTableColor(e.target.value)}
                       className="w-16 h-16 border-none rounded-full cursor-pointer"
                     />
                   </div>
               
                   {/* Paddle Color Selection */}
                   <div className="flex flex-col items-center gap-4 w-full">
                     <h2 className="text-2xl text-white">{t('rgame.chosepaddle')}</h2>
                     <div className="flex gap-4">
                       <input
                         type="color"
                         value={paddleColor}
                         onChange={(e) => setPaddleColor(e.target.value)}
                         className="w-16 h-16 border-none rounded-full cursor-pointer"
                       />
                     </div>
                   </div>
               
                   {/* Ball Color Selection */}
                   <div className="flex flex-col items-center gap-4 w-full">
                     <h2 className="text-2xl text-white">
                          {t('rgame.choseball')}
                     </h2>
                     <input
                       type="color"
                       value={ballColor}
                       onChange={(e) => setBallColor(e.target.value)}
                       className="w-16 h-16 border-none rounded-full cursor-pointer"
                     />
                   </div>
               
                   {/* Alias Inputs */}
                   <div className="flex flex-col items-center gap-4 w-full">
                     <input
                       type="text"
                       placeholder={t('localgame.playerAlias')}
                       value={playerAlias}
                       onChange={(e) => setPlayerAlias(e.target.value)}
                       className="mb-2 p-3 w-full max-w-[300px] rounded text-black placeholder-gray-600 font-semibold"
                     />
                     <input
                       type="text"
                       placeholder={t('localgame.opponentAlias')}
                       value={opponentAlias}
                       onChange={(e) => setOpponentAlias(e.target.value)}
                       className="mb-2 p-3 w-full max-w-[300px] rounded text-black placeholder-gray-600 font-semibold"
                     />
                   </div>
               
                   {/* Start Match Button */}
                   <button 
                     onClick={startMatch}
                     className="bg-blue-500 px-6 py-3 rounded mt-4 text-black font-semibold hover:bg-blue-400 transition duration-200 w-full max-w-[300px]"
                   >
                    {t('localgame.startmatch')}
                   </button>
                 </div>
               </div>
               
                
                )}
                {isMatchReady && (
                    <>
                        <div className="flex w-screen justify-center fixed top-[3em]">
                            <p className="font-[walo]">{playerAlias}: {playerScore}</p>
                        </div>
                        <div className="flex w-screen justify-center fixed bottom-[3em]">
                            <p className="font-[walo]">{opponentAlias}: {opponentScore}</p>
                        </div>
                    </>
                )}
                {isMatchOver && !isMatchActive && (
                    <div className="flex justify-center items-center w-screen h-screen fixed flex-col">
                        <div className="text-9xl font-light text-green-500">
                            {winner} {t('localgame.Wins')}
                        </div>
                        <button onClick={startMatch} className="bg-green-500 px-4 py-2 rounded mt-4">
                            {t('localgame.restartmatch')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PingPongGame;
