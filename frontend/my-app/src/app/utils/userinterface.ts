// types.ts
export interface User {
    id: number;
    username: string;
    level: number;
    name?: string;
    email: string;
    is_online: boolean;
    friends: string[];
    profile_picture: string;
    score?: number;
    statistics: number[];
    blocked: string[];
    bio: string;
    is_activeTwoFactor: boolean;
    otp_secret: string;
    otp_time: Date | null;
    status: string;
  }
  
  export interface Friendship {
    id: number;
    from_user: number;
    to_user: number;
    status: 'requested' | 'accepted' | 'rejected';
    created_at: string;
}

export interface APIResponse {
    message: string;
}

export interface GameRequest {
  id: number;
  sender: string;
  receiver?: string; // Make optional if appropriate
  gameId?: string;   // Make optional if appropriate
  status: string;
}
export interface tournament {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  game: string;
  participants: number;
  max_participants: number;
  is_active: boolean;
  is_finished: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface player
{
  alias: string;
  score: number;
  is_winner: boolean;
}
export interface GameProps {
  players:player[];
  status: 'pending' | 'completed';
  winnerInGame: string;
  score: string;
  setGame: (game: GameProps ) => void;
}
export interface parames {
  uid: string;
  token: string;
}
export interface PageProps {
  params: parames;
  searchParams: { [key: string]: string | string[] | undefined };
}
