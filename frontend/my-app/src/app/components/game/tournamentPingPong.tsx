"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {GameProps} from '@/app/utils/userinterface';
import { useTranslation } from 'react-i18next';

const MAX_SCORE = 5;

const Paddle = React.forwardRef<THREE.Mesh, { position: [number, number, number]; color: string, }>(
    ({ position, color }, ref) => (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[0.8, 0.1, 0.2]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
);

const Ball: React.FC<any> = ({ playerPaddleRef, opponentPaddleRef, onScore, isMatchActive}) => {
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
            velocity.current.z = Math.abs(velocity.current.z);
            velocity.current.x += (ball.position.x - playerPaddle.position.x) * 0.02;
        }
        if (checkCollision(opponentPaddle)) {
            velocity.current.z = -Math.abs(velocity.current.z);
            velocity.current.x += (ball.position.x - opponentPaddle.position.x) * 0.02;
        }

        if (ball.position.z > tableLength) {
            onScore("player");
            resetBall();
        } else if (ball.position.z < -tableLength) {
            onScore("opponent");
            resetBall();
        }
    });

    const resetBall = () => {
        ref.current.position.set(0, 0.2, 0);
        velocity.current.set(0.020, 0, 0.06);
    };

    return (
        <mesh ref={ref} position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="white" />
        </mesh>
    );
};

const Table = () => (
    <>
        <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[3, 0.2, 6]} />
            <meshStandardMaterial color="green" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3, 0.2, 0.05]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </>
);

// interface GameProps {
//     players: any;
//     status: string;
//     winnerInGame: string;
//     score: string;
//     setGame: any;
// }
const PingPongGame: React.FC<GameProps> = ({players, status, winnerInGame, setGame, score}) => {
    const playerPaddleRef = useRef<THREE.Mesh>(null!);
    const opponentPaddleRef = useRef<THREE.Mesh>(null!);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [isMatchReady, setIsMatchReady] = useState(false);
    const [isMatchActive, setIsMatchActive] = useState(false);
    const [playerAlias, setPlayerAlias] = useState("");
    const [opponentAlias, setOpponentAlias] = useState("");
    const { t } = useTranslation();
    useEffect(() => {
        if (players && players.length > 0) {
      setPlayerAlias(players[0].alias);
      setOpponentAlias(players[1].alias);
    }
  }, [players]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isMatchReady || !isMatchActive) return;

            const speed = 0.5;
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
            alert(t('both'));
            return;
        }
        setIsMatchReady(true);
        setIsMatchActive(true);
        setPlayerScore(0);
        setOpponentScore(0);
    };

    const isMatchOver = playerScore === MAX_SCORE || opponentScore === MAX_SCORE;
    const winner = playerScore === MAX_SCORE ? playerAlias : opponentAlias;
    if (players && players.length > 0 && winner && isMatchOver && !isMatchActive ) {
        players[0].score = playerScore;
        players[1].score = opponentScore;
        players[0].is_winner = playerScore === MAX_SCORE;
        players[1].is_winner = opponentScore === MAX_SCORE;
        status = 'completed';
        winnerInGame = winner;
        score = `${playerScore} - ${opponentScore}`;
        setGame({players: players, status: status, winnerInGame: winnerInGame, score: score, setGame: setGame});
    }
    const onExit = () => {
        window.location.reload();
    };

    return (
        <div className="w-screen h-screen bg-neutral-900 absolute">
            <Canvas camera={{ position: [0, 2, 5], fov: 75 }} className="bg-transparent w-screen">
                {!isMatchOver && (
                    <>
                    <ambientLight intensity={10} />
                    <pointLight position={[40, 50, 50]} color="red" />
                        <Table  />
                        <Paddle ref={playerPaddleRef} position={[0, 0.2, -2.5]} color="#f7e77c" />
                        <Paddle ref={opponentPaddleRef} position={[0, 0.2, 2.5]} color="#f7e77c" />
                        {isMatchReady && (
                            <Ball
                                playerPaddleRef={playerPaddleRef}
                                opponentPaddleRef={opponentPaddleRef}
                                onScore={handleScore}
                                isMatchActive={isMatchActive}
                            />
                        )}
                    </>
                )}
                <OrbitControls />
            </Canvas>
            
            <div className="absolute top-4 left-4 text-white flex flex-col font-[Roquila] text-3xl ">
                {!isMatchReady && !isMatchActive && (
                    <div  className="w-screen h-screen bg-black flex justify-center items-center">
                        <div className="flex flex-col w-[50%] gap-3">
                        {
                            players && players.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <input
                                            type="text"
                                            placeholder={players[0].alias}
                                            value={playerAlias}
                                            className="mb-2  rounded text-black"
                                        />
                                    <input
                                        type="text"
                                        placeholder={players[1].alias}
                                        value={opponentAlias}
                                        className="mb-2  rounded text-black"
                                    />
                                </div>
                            )
                        }
                        <button onClick={startMatch} className="bg-blue-500 px-4 py-2 rounded mt-4 text-black ">
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
            </div>
        </div>
    );
};


export default PingPongGame;
