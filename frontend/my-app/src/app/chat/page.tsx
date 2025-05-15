"use client";
import React, { useState, useEffect, useRef } from "react";
import { alluserdata } from "./chatPr";
import FriendList from "./FriendList";
import Conversation from "./Conversation";
import { api } from "@/app/services/api";
import "./style.css";
import cookie from "js-cookie";
import { getUserConversations, getUserData } from "./chatPr";
import { useTranslation } from "react-i18next";
import { User } from "@/app/utils/userinterface";
import { Texto } from "@/app/components/styles/Texto";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}


export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
}

const Page: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const globalsocket = useRef<WebSocket | null>(null);
  const friendSocketRef = useRef<WebSocket | null>(null);
  const token = cookie.get("access");


  useEffect(() => {
    if (!token) {
      setError('No access token found');
      return;
    }
    const friendSocket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
    friendSocketRef.current = friendSocket;

    friendSocket.onopen = () => {
      friendSocket.send(JSON.stringify({ action: 'get_friends' }));
    };

    friendSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'friends_list') {
        setFriends(data.friends);
      }
      if ( data.status === 'accepted') {
        friendSocket.send(JSON.stringify({ action: 'get_friends' }));
      }

    };
  }, [token, friendSocketRef, setFriends]);


  const updateFriendList = (a: Message) => {
    setFriends((prevFriends) => {
      const updatedFriends = prevFriends.map((friend) => {
        if (friend.id === friend.id) {
          return {
            ...friend
          };
        }
        return friend;
      });
  
      return [...updatedFriends];
    });
  };

  

  useEffect(() => {
    const token = cookie.get("access");
    globalsocket.current = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/chat/unread-messages/?token=${token}`);

    globalsocket.current.onopen = () => {
    };

      globalsocket.current.onmessage = (event) => {
      try 
      {
          const data = JSON.parse(event.data);
          if(data.type === "update_status")
          {
            setFriends((prev) =>
              prev.map((friend) =>
                friend.id === data.user.id ? { ...friend, status: data.user.status } : friend
              )
            );
          }
          updateFriendList(data);
      } 
      catch (error) {
        console.clear();
      }
    };
    

    if (token && !currentUser) {
      getUserData()
      .then(({ user }) => {
        setCurrentUser(user);
      })
      .catch((error) => {
        console.clear();
      });
      
      getUserConversations().catch((error) => {
        console.clear();
      });
    }
   
  }, [currentUser]);

  const { t } = useTranslation();

  const friendsList: User[] = friends;

  return (
    <div className="flex justify-center flex-col items-center">
      <Texto
        words={t("chat.chat")}
        className=" lg:text-[10rem] text-9xl text-gradient1 text-center my-6 font-[Roquila] rounded-xl flex justify-center "
      />
      <div className="flex flex-row gap-5">

                {selectedFriend && (
                  <div className="w-[50%] flex-1">
                    <Conversation
                      friends={friendsList}
                      setFriends={setFriends}
                      friend={selectedFriend}
                      onBackClick={() => setSelectedFriend(null)}
                      globalsocket={globalsocket.current!}
                    />
                  </div>
                )}
        <div className="absolute lg:fixed right-4">
        <FriendList
            friends={friendsList}
            onFriendClick={(friend) => {
                setSelectedFriend(friend);
            }}
          />

        </div>
      </div>
    </div>
  );
};

export default Page;