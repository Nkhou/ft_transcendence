import { useCallback, useEffect, useState } from 'react';
import cookie from 'js-cookie';
import { User } from '@/app/utils/userinterface';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';




const PlayButton: React.FC<{ selectedFriend: User | null }> = ({ selectedFriend }) => {
    const [websocket, setWebsocket] = useState<WebSocket | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation();

    // Establish WebSocket connection
    useEffect(() => {
        const token = cookie.get('access');
        const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/game-request/?token=${token}`);
    
        setWebsocket(socket);
    
        socket.onopen = () => {
         
        };
    
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
    
          if (data.status === 'success') {
            setNotification(t('game_request_sent'));
          } else if (data.status === 'failure') {
            setNotification(t('game_request_failed'));
          } else if (data.status === 'accepted' && data.type === 'game_request_status_update') {
            setNotification(t('game_request_accepted'));
    
            const game_id = data.game_request_id;
            if (game_id) {
              cookie.set('game_id', game_id);
              router.push(`/game/${game_id}`); 
            } else {
              router.push('/game'); 
            }
          } else if (data.status === 'rejected') {
            setNotification(t('game_request_rejected'));
          }
        };
    
      }, [router]);

    const handlePlayClick = useCallback(() => {
        if (websocket && selectedFriend) {
            const message = {
                action: 'send_play_notification',
                receiver_id: selectedFriend.id,
            };
            websocket.send(JSON.stringify(message));
            setNotification('Sending game request...');
        }
    }, [websocket, selectedFriend]);

    return (
        <div>
            <button
                onClick={handlePlayClick}
                className="w-[10rem] h-7 text-white font-[walo] font-bold mx-4 rounded-lg hover:bg-gradient-to-l transition-colors duration-300"
            >
                {t('friends.play')}
            </button>
            {notification && (
                <div className="text-center mt-4 font-bold text-green-500">
                    {notification}
                </div>
            )}
        </div>
    );
};
export default PlayButton;