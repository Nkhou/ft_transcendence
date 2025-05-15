"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/services/api';
import { useTranslation } from 'react-i18next';


interface Params {
  uid: string;
  token: string;
}

const Page = ({ params }: { params: Params }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);  
  const  [redirect, setRedirect] = useState(false);

  const router = useRouter();
  const { uid, token } = params;
  const { t } = useTranslation();


  useEffect(() => {
    if (uid && token && !isReset) {
      const verifyToken = async () => {
        setLoading(true);
        try {
          const response = await api.post(`api/users/validate-reset-password-token/${uid}/${token}/`, {});
          if (response.status === 200) {
            setIsTokenValid(true);
          } else {
            setError('Invalid or expired token.');
            setIsTokenValid(false);
          }
        } catch (error) {
          setError('Invalid or expired token.');
          setIsTokenValid(false);
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    }
  }, [uid, token, isReset]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password.length < 6) {
      setError(t('settings.passwordsizemust'));
      return;
    }
    


    if (password !== confirmPassword) {
      setError(t('settings.passworddontmatch'));
      setConfirmPassword('');
      setPassword('');
      return;
    }

    if (!password || !confirmPassword) {
      setError(t('settings.fillallfields'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/api/users/reset-password/${uid}/${token}/`, { password });
      if (response.status === 200) {
        setSuccessMessage(t('resetPassword.successMessage'));
        setRedirect(true);
        setIsTokenValid(false);
      } else {
        
        setError(t('settings.failedtochange'));
      }
    } catch (error) {
      setError(t('settings.failedtochange'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bg-black h-screen w-screen inset-0 flex items-center justify-center font-[walo]">

  {loading && <div className="spinner">Loading...</div>} 

  {isTokenValid ? (
    <form
      onSubmit={handleReset}
      className="max-w-md mx-auto mt-10 p-8 bg-gradient-to-br from-purple-600 to-indigo-800 shadow-lg rounded-lg text-white"
    >
      <h2 className="text-2xl font-bold text-center mb-6">{t('resetPassword.title')}</h2>
      <div className="space-y-4">
        <input
          type="password"
          placeholder={t('resetPassword.newPasswordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="font-[abelhid] w-full px-4 py-2 bg-transparent border-2 border-purple-400 rounded-md text-white placeholder-purple-200 focus:ring-2 focus:ring-purple-300 focus:outline-none"
        />
        <input
          type="password"
          placeholder={t('resetPassword.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="font-[abelhid] w-full px-4 py-2 bg-transparent border-2 border-purple-400 rounded-md text-white placeholder-purple-200 focus:ring-2 focus:ring-purple-300 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full py-2 bg-purple-700 rounded-md font-semibold text-lg hover:bg-purple-600 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
        >
          {t('resetPassword.resetButton')}
        </button>
        {error && <p className="text-red-500">{error}</p>} 
      </div>
    </form>
  ) : (
    <div className="w-screen flex items-center justify-center">
      {redirect ? (
        <div className=" w-screen p-4 text-center flex items-center justify-center flex-col ">
          <p className="text-green-500">{successMessage}</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push('/login-signup')}
              className="w-[30em] py-2 bg-purple-700 rounded-md font-semibold text-lg hover:bg-purple-600 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
            >
              {t('resetPassword.goToLogin')}
            </button>
          </div>
        </div>
      ) : error && (
        <div className="flex flex-col gap-4">
          <p className="text-white">{error}</p>
          <button 
            onClick={() => router.push('/login-signup')}
            className="text-white w-full py-2 bg-purple-700 rounded-md font-semibold text-lg hover:bg-purple-600 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
          >
            {t('resetPassword.goToLogin')}
          </button>
        </div>
      )}
    </div>
  )}
</div>

  );
};

export default Page;
