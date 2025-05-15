"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Cookie from 'js-cookie';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getuserstatus } from '@/app/components/login-signup/resetpwd';
import Background from '../Background/Background';
import LanguageSwitcher from '../languageComponents/languageswitcher';
import { Vortex } from '../login-signup/back';
import Image from 'next/image';
import { api } from '@/app/services/api';
import { api2 } from '@/app/utils/auth';
import ChangeEmailModal from './updateEmail';


interface SettingsProps {
  setSettings: (value: boolean) => void;

}

const Settings: React.FC<SettingsProps> = ({ setSettings }) => {
  const { t } = useTranslation();
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [account, set_account] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50); // Initial volume set to 50%
  const [isvalid, set_isvalid] = useState<boolean>(false);
  const [username, set_username] = useState<string>('');
  const [user, set_user] = React.useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwd, set_pwd] = useState<boolean>(false);
  const [email, set_email] = useState<boolean>(false);
  const [theme, set_theme] = useState<boolean>(false);
  const [blocked, setBlocked] = useState(false);
  const blockedBarRef = useRef<HTMLDivElement | null>(null);
  const friendSocketRef = useRef<WebSocket | null>(null);
  const [Language, setLanguage] = useState<boolean>(false);
  const [blockedFriends, setBlockedFriends] = useState<number[]>([]);
  const token = Cookie.get('access');
  if (!token) {
    throw new Error('No token found');
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(oldPassword.length < 6) {
      setError(t('settings.passwordsizemust'));
      return;
    }
    if(newPassword.length < 6) {
      setError(t('settings.passwordsizemust'));
      return;
    }
    try {
      const response = await api.post(
        '/api/users/change-password/',
        {
          old_password: oldPassword, new_password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      );
      setMessage(response.data.message);
      setError('');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage('');
      if(err.response?.data?.error) {
        if(err.response.data.error === 'Invalid old password') {
          setError(t('settings.invalidOldPassword'));

        }
        else if( err.response.data.error === 'Invalid new password') {
          setError(t('settings.invalidnewPassword'));
        }
      }
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  useEffect(() => {
    if (blocked) {
      const token = Cookie.get('access');
      const friendSocket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/friendship/?token=${token}`);
      friendSocketRef.current = friendSocket;

      friendSocket.onopen = () => {
        friendSocket.send(JSON.stringify({ action: 'get_blocked_friends' }));
      };

      friendSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);


        if (data.type === 'blocked_friends') {
          setBlockedFriends(data.blocked_users);
        } else if (data.type === 'friend_unblocked') {
          setBlockedFriends(data.blocked_users);
        }
      };


    }
  }, [blocked]);

  const handleBlockFriend = () => {
    setBlocked(!blocked);
  };

  const handleUnblockFriend = async (id: number) => {
    try {
      const token = Cookie.get('access');
      const friendSocket = friendSocketRef.current;

      if (friendSocket) {
        friendSocket.send(JSON.stringify({
          action: 'unblock_friend',
          username: id,
        }));
      }
    } catch (error) {
      console.clear();
    }
  };


  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('dark') === 'true';
    setDarkMode(isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
  }, []);

  const handleThemeChange = (mode: boolean) => {
    setDarkMode(mode);
    localStorage.setItem('dark', mode.toString());
    document.body.classList.toggle('dark', mode);
  };
  const get_user_id = async () => {
    try {
      const response = await api.get('api/users/me/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      return response.data.id;
    }
    catch (error) {
      console.clear();
    }
  }
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await getuserstatus();
        set_user(user1);
        set_isvalid(user1.is_activeTwoFactor);
        set_username(user1.username);
      } catch (error) {
        console.clear();
        throw error;
      }
    }
    gsap.from('.settings', {
      duration: 0.2,
      opacity: 1,
      ease: 'power4.out',
    });
    fetchUser();
  }, []);

  const handleMouseEnter = (index: number) => {
    if (settingsRef.current) {
      const items = settingsRef.current.querySelectorAll<HTMLParagraphElement>('p');
      items.forEach((item, i) => {
        if (i === index) {
          gsap.to(item, {
            scale: 1.2,
            duration: 0.3,
            ease: 'power4.out',
          });
        } else {
          gsap.to(item, {
            scale: 0.9,
            duration: 0.3,
            ease: 'power4.out',
          });
        }
      });
    }
  };
  const delete_acc = async () => {
    const userdata = await get_user_id();

    try {
      axios.delete(`https://${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/users/${userdata}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((response) => {
          if (response.status == 204) {
            window.location.href = '/';
            Cookie.remove('access');
            Cookie.remove('refresh');
          }
        }).catch((error) => {
        });

    }
    catch (error) {




    }
  }
  const open_account_settings = () => {
    set_account(true);
  }
  const enable_language = () => {
    setLanguage(!Language);
  }
  const enable2fa = () => {
    if (!user) {
      return <div>loading...</div>;
    }
    // set_isvalid(user.is_activeTwoFactor);
    try {
      set_isvalid(true);
      if (isvalid == false) {
        api.post('api/users/two-factor-auth/', {
          username: username,
          is_activeTwoFactor: true
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((response) => {
            set_isvalid(true);
          }).catch((error) => {
            set_isvalid(false);
          });
      }
      else {
        set_isvalid(false);
        api.post('api/users/two-factor-auth/disable/', {
          username: username,
          is_activeTwoFactor: false
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((response) => {
            set_isvalid(false)
          }).catch((error) => {
            set_isvalid(false);
          });
      }
    }
    catch (error) {
      console.clear();
    }
  }

  const handleMouseLeave = () => {
    if (settingsRef.current) {
      const items = settingsRef.current.querySelectorAll<HTMLParagraphElement>('p');
      items.forEach((item) => {
        gsap.to(item, {
          scale: 1,
          duration: 0.3,
          ease: 'power4.out',
        });
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10); // Parse value as integer
    setVolume(value);
  };

  const changepwd = () => {
    set_pwd(true);
  }
  const change_email = () => {
    set_email(true);
  }
  const settheme = () => {
    set_theme(true);
  }

  return (
    <div
      className="settings w-full h-full flex bg-gray-900 dark:bg-gray-900 text-[#7F00FF] dark:text-white justify-center items-center align-center flex-col gap-9 bg-opacity-80 dark:bg-opacity-50 backdrop-blur-xl"
      ref={settingsRef}
    >
      <h1 className="text-3xl font-[walo]">{t('Settings')}</h1>

      {[t('')].map((item, index) => (
        <React.Fragment key={index}>
          <p
            className="text-lg font-[walo] ease-in-out cursor-pointer"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {item}
          </p>

          {
            index == 0 && (
              <div onClick={open_account_settings}>
                <p className="text-lg font-[walo] ease-in-out cursor-pointer font-[Roquila]">
                  {t('settings.accsettings')}
                </p>
              </div>



            )
          }
          {
            index == 0 && (
              <div onClick={enable_language}>
                <p className="text-lg font-[walo] ease-in-out cursor-pointer font-[Roquila]">
                  {t('settings.changelanguage')}
                </p>
              </div>
            )
          }

        </React.Fragment>
      ))


      }


      {account && (
        <>
          <div className=' fixed inset-0 w-screen h-screen bg-black  z-[999999999999]  flex items-center justify-center  backdrop-blur-xl background-opacity-10 flex-col gap-5 '>
            <div className="fixed inset-0 w-screen h-screen z-[-1]">

              <Vortex
                particleCount={50}
                rangeSpeed={110}
                baseHue={900}
                backgroundColor='rgba(0,0,0,0.5)'
                baseRadius={2}

              />
            </div>
            <div className="flex w-screen items-center justify-center font-[Roquila]">
              <h1 className=' lg:text-9xl  fixed top-[10rem]  text-gradient1 my-10 md:text-8xl sm:text-7xl text-6xl  '> {t('accountsettings.accountSettings')}</h1>

            </div>
            <div className="flex flex-col items-center gap-4">
              <button className='font-[walo] text-2xl px-6 text-white hover:text-purple-500' onClick={change_email}>{t('accountsettings.changeemail')}</button>
              <button className='font-[walo] text-2xl px-6 text-white hover:text-purple-500' onClick={handleBlockFriend}>{t('accountsettings.blockedfriends')}</button>


              {/* reset password page  */}
              {
                pwd && (
                  <>

                    <div className="fixed inset-0 bg-stone-950 z-[999999999999] flex w-screen h-screen items-center justify-center flex-col gap-4">
                      <Image
                        src="/icons/close.svg"
                        alt="close"
                        width={50}
                        height={50}
                        className="absolute top-0 right-0 m-4 cursor-pointer"
                        onClick={() => set_pwd(false)}
                      />
                      <div>
                        <button className="font-[Roquila] text-8xl px-6 text-gradient1">
                          {t('accountsettings.changePassword')}
                        </button>
                      </div>
                      {error && <p className="text-red-500">{error}</p>}
                      {success && <p className="text-green-500">{success}</p>}
                      <input
                        type="password"
                        placeholder={t('placeholders.enterOldPassword')}
                        className="text-white bg-neutral-800 rounded-xl w-[19rem] h-[3em] font-[abelhid] font-bold text-start px-4"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder={t('placeholders.enterNewPassword')}
                        className="text-white bg-neutral-800 rounded-xl w-[19rem] h-[3em] font-[abelhid] font-bold text-start px-4"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        className="font-[walo] text-xl px-6 text-gradient1 hover:text-white bg-neutral-900 h-[3em] my-6 rounded-xl hover:bg-yellow-600"
                        onClick={handleSubmit}
                      >
                        {t('profile.save')}
                      </button>
                    </div>
                  </>
                )
              }


              {/* reset email page  */}

              {
                email && (
                  <ChangeEmailModal
                    set_email={set_email}
                    email={email}
                    t={t}
                    token={token}

                  />
                )
              }
              {blocked && (
                <div
                  ref={blockedBarRef}
                  className="fixed right-0 top-0 h-full w-full bg-black bg-opacity-90 backdrop-blur-lg z-[999999] p-4 overflow-y-auto flex flex-col items-center justify-center"
                >
                  <Image
                    src="/icons/close.svg"
                    alt="Close"
                    width={30}
                    height={30}
                    className="text-neutral-700 dark:text-white fixed top-5 right-3 cursor-pointer"
                    onClick={handleBlockFriend}
                  />

                  <div className="flex flex-col w-full h-full items-center justify-center">
                    <h2 className="text-2xl font-bold text-white mb-6 font-[walo]">
                      {t('accountsettings.blockedfriends')}
                    </h2>

                    {blockedFriends.length > 0 ? (
                      <div className="w-full max-w-md space-y-4">
                        {blockedFriends.map((id, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md space-x-4"
                          >
                            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">ID</span>
                            </div>
                            <div className="text-white flex-1">
                              <span>{t('blocked.user')} ID: {id}</span>
                            </div>
                            <div>
                              <button
                                onClick={() => handleUnblockFriend(id)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                              >
                                {t('blocked.unblock')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white">{t('blocked.noblockedusers')}</p>
                    )}
                  </div>
                </div>
              )}

          <button className='font-[walo] text-2xl px-6 text-white hover:text-purple-500' onClick={changepwd}>{t('accountsettings.changePassword')}</button>
          <div className="flex flex-col items-center gap-2">
            <button className='font-[walo] text-2xl px-24 text-white ' onClick={enable2fa}>{t('accountsettings.enable2FA')}</button>
            <label className='autoSaverSwitch relative inline-flex cursor-pointer select-none items-center'>
              <input
                type='checkbox'
                name='autoSaver'
                className='sr-only'
                checked={isvalid}
                onChange={enable2fa}
              />
              <span
                className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${isvalid ? 'bg-[#4acf93]' : 'bg-[#CCCCCE]'
                  }`}
              >
                <span
                  className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${isvalid ? 'translate-x-6' : ''
                    }`}
                ></span>
              </span>
              <span className='label flex items-center text-sm font-medium text-black'>
                {/* Auto Saver <span className='pl-1'> {isvalid ? 'On' : 'Off'} </span> */}
              </span>
            </label>
          </div>
          <button className='font-[walo] text-2xl px-6 text-red-900 hover:text-red-400' onClick={delete_acc}>{t('accountsettings.deleteAccount')}</button>

          <button
            onClick={() => set_account(false)}
            className="absolute top-4 right-4 z-50 p-2 shadow-md text-white"
          >
            <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
          </button>
        </div>
    </div>
        </>
      )
      }

{
  Language && (
    <>
      <button onClick={enable_language} className='bg-white text-black fixed right-5 ' />

      <LanguageSwitcher enablelanguage={enable_language} />
    </>
  )
}

<button
  onClick={() => setSettings(false)}
  className="absolute top-4 right-4 z-50 p-2 shadow-md text-white "
>
  <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" />
</button>

    </div >
  );
};

export default Settings;
