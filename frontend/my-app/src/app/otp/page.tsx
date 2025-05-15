"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// import { setCookie } from '../utils/cookies';
import { loginOtp } from '../components/login-signup/login';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/otp/otp';
import {ForgotPassword} from '@/app/components/login-signup/resetpwd';
import Background from '../components/Background/Background';
import { useTranslation } from 'react-i18next';
import { api } from '@/app/services/api';



const InputForm = () => {
  const [Otp, setOtp] =  useState<string[]>(new Array(6).fill(''));
  const [otpValue, setOtpValue] = useState('');
  const router = useRouter();
  const [responseMessage, setResponseMessage] = useState('');
  const inpuR = useRef<Array<HTMLInputElement | null>>([]); 
  const { t } = useTranslation(); 
  
  
  const handleChange = (value: string) => {
    setOtp(value.split(''));
    if (value.length > 6) {

      inpuR.current[5]?.focus();
    }
    if (value.length === 6) {
      setOtpValue(value);
    }
  };
  const resetFields = async () => {
    try {
      const response = await ForgotPassword(loginOtp.username, loginOtp.password);
    }
    catch (error) {
      setResponseMessage('Error occurred while sending data');
    }
  }

  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Otp || Otp.length < 6) {
      setResponseMessage('Please enter the OTP');
      return;
    }
    try {
      const response = await api.post('api/users/two-factor-auth/validate/', {
        otp: otpValue,
        username: loginOtp.username,
        password: loginOtp.password,
      });
     
      router.push('/dashboard');
    } catch (error) {
      setResponseMessage('Error occurred while sending data');
    }
  };
  useEffect(() => {
    const token = Cookies.get('access');
    if (token) {
      router.push('/dashboard');
    }
    if (!loginOtp.username || !loginOtp.password) {

      router.push('/login-signup');
    }
  }, [router]);
  return (
    
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-start w-[60%]">
        <Background theme='default' />
        <div className="text-purple-700 text-7xl md:text-8xl lg:text-9xl mt-[25rem]">
          <h1 className='font-[walo]'>Ping Pong</h1>
        </div>
        <div className="w-full flex flex-col items-center mt-10 mx-auto px-4 h-full flex flex-col items-center justify-start w-[60%] sm:w-[2rem]">
          <form onSubmit={handleSubmit}>
            <InputOTP 
                maxLength={6}
                value={Otp.join('')}
                onChange={handleChange}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index}
                      className="lg:w-12 lg:h-12 text-center text-2xl border border-[0.0001rem] rounded-lg bg-white text-black  outline-none m-4 p-2 w-10 h-10 "

                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            <div className="mt-4 mx-auto px-4 h-full flex flex-row items-center justify-center gap-5">   
              <button
                 type="button"
                 className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-purple-500 text-white rounded-full hover:text-black hover:bg-gray-100 focus:ring-4 dark:bg-purple-900 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 font-[walo]"
                 onClick={resetFields}
               >
                 {t('Otp.resend')}
               </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-purple-500 text-white rounded-full hover:text-black hover:bg-gray-100 focus:ring-4 dark:bg-purple-900 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 font-[walo]"
              >
               {t('Otp.login')}
              </button>
            </div>
          </form>
          {responseMessage && <div className="fixed left-5 top-7 bg-purple-100 w-[30rem] h-[5rem] text-white font-[walo]">
            <p>
            {responseMessage}
            </p>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
