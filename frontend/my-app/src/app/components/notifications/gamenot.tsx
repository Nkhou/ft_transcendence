import React, { useState, useEffect, useRef } from 'react';
import Cookie from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const GameNotif: React.FC = () => {
    const [gameRequests, setGameRequests] = useState<{ id: number; sender: string; receiver: string; status: string }[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const { t } = useTranslation();
    const router = useRouter();
    const gameSocketRef = useRef<WebSocket | null>(null);
    const [gameId, setGameId] = useState<number | null>(null);


    const token = Cookie.get('access');
    if (!token) {
        setNotification('No access token found');
        return null;
    }
    useEffect(() => {
      const gameSocket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/game-request/?token=${token}`);
      gameSocketRef.current = gameSocket;
  
      gameSocket.onopen = () => {
        gameSocket.send(JSON.stringify({ action: 'get_pending_requests' }));
      };
  
      gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
      
        if (data.type === 'game_request_status_update') {
          setGameId(data.game_request_id);
          Cookie.set('game_id', data.game_request_id.toString());
          router.push(`/game/${data.game_request_id}`);
        }
      
        if (data.type === 'game_request_notification') {
          if (data.id && data.sender && data.receiver && data.status) {
            setGameRequests((prev :any ) => [
              ...prev,
              { id: data.id, sender: data.sender, receiver: data.receiver, status: data.status },
            ]);
          } else {
            setNotification('Received incomplete game request data.');
          }
        }
  
      };
      
    }, [token, router,setGameRequests]);
  
    const handleGameRequestResponse = async (requestId: number, action: 'accept' | 'reject') => {
      try {

        const socket = gameSocketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          return;
        }
  
        if (!requestId) {
          return;
        }
  
        socket.send(JSON.stringify({
          action: action === 'accept' ? 'accept_request' : 'reject_request',
          game_request_id: requestId,
        }));
        if(action === 'accept')
          {
            setNotification(t('game_request_accepted'));
          }
        if(action === 'reject')
          {
            setNotification(t('game_request_rejected'));
          }
        setGameRequests((prev :any ) => prev.filter((request :any ) => request.id !== requestId));
  
        if (action === 'accept' && gameId) {
          setGameId(gameId);
          Cookie.set('game_id', gameId.toString());
          router.push(`/game/${gameId}`);
        }
  
      } catch (error: any) {
        console.clear();
      }
    };

    return (
      <div className="flex flex-col items-center p-6 font-[walo]">
       <h1 className="text-white text-3xl font-semibold mb-4">{t('GameRequest.gameRequest')}</h1>
            {gameRequests.length > 0 ? (
                <ul className="w-full max-w-lg overflow-auto max-h-[40vh]">
                    {gameRequests.map((request) => (
                        <li key={request.id} className="bg-gray-700 text-white p-4 mb-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-medium">{request.sender}</h2>
                            <p className="text-xs mb-3">{t('GameRequest.sentYou')}</p>
                            <div className="flex space-x-4">
                                <button
                                    className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-400"
                                    onClick={() => handleGameRequestResponse(request.id, 'accept')}
                                >
                                    {t('GameRequest.accept')}
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
                                    onClick={() => handleGameRequestResponse(request.id, 'reject')}
                                >
                                    {t('GameRequest.reject')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-white">{t('GameRequest.No')}</p>
            )}

            {notification && (
                <div className="mt-4 p-2 bg-blue-500 text-white rounded">{notification}</div>
            )}
        </div>
    );
}
export default GameNotif;