import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import cookie from 'js-cookie';
import { User } from '@/app/utils/userinterface';

interface FriendMenuProps {
  friend_id: number;
  setFriends: (value: User[]) => void;
}

export default function FriendMenu({ friend_id, setFriends }: FriendMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [friendSocket, setFriendSocket] = useState<WebSocket | null>(null);
  const open = Boolean(anchorEl);
  const token = cookie.get('access'); // Ensure token is set correctly

  // Handle opening and closing the menu
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Set up WebSocket connection in useEffect
  useEffect(() => {
    const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
    setFriendSocket(socket); 

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: 'get_friends' }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'friends_list') {
        setFriends(data.friends); 
      }

      if (data.status === 'accepted') {
        socket.send(JSON.stringify({ action: 'get_friends' }));
      }

      if (data.type === 'friend_removed') {
        setFriends(data.friends); 
      }
      if (data.type === 'friend_blocked') {
        setFriends(data.friend);
      }
    };





  }, [token, setFriends]);

  const removeFriend = () => {
    if (friendSocket) {
      // Send the remove friend action
      friendSocket.send(JSON.stringify({ action: 'remove_friend', friend_id }));
    }
  };
  const handleBlockFriend = () => {
    if (friendSocket) {
      // Send the block friend action
      friendSocket.send(JSON.stringify({ action: 'block_friend', friend_id }));
    }
  }
  return (
    <div className="w-[10rem] h-7 text-white font-[walo] mx-5 z-[999999999999999]">
      <button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className=""
      >
        . . .
      </button>

      <div className="z-[9999999999999999999]">
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            onClick={() => {
              removeFriend(); // Call the remove friend function
              handleClose();  // Close the menu after the action
            }}
            style={{ color: 'gray', fontFamily: 'walo' }}
          >
            {t('friends.removeFriend')}
          </MenuItem>
          <MenuItem onClick={() =>{
            handleBlockFriend();
            handleClose(); 
          }} style={{ color: 'red', fontFamily: 'walo' }}>
            {t('friends.blockFriend')}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
