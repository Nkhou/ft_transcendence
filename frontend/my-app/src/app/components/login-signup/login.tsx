"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '../../services/api';
import { setCookie } from '../../utils/cookies';
import {api} from '../../services/api';
import { gsap } from 'gsap';
import Cookies from 'js-cookie';
import Image from 'next/image';

interface loginOtp
{
  username: string;
  password: string;
}
export let loginOtp: loginOtp  = { username: '', password: '' };

export const setLoginOtp = (username: string, password: string) => {
  loginOtp = { username, password };
}

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({ username: false, password: false, email: false });
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);


  const checkotoptwo = async (username: string, password: string) => {
    
    return api.post('/api/users/two-factor-send-otp/', {
      username,
      password,
    });
  }

  useEffect(() => {
    if (errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [error]);

  useEffect(() => {
    if (successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, x: 20, y: -20 },
        { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.5 }
      );
      const timer = setTimeout(() => {
        gsap.to(successRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => setSuccessMessage('') 
        });
      }, 2000);

      return () => clearTimeout(timer); 
    }
  }, [successMessage]);


  
  const LoginIntra = async () => {
    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d775ee024268440ff54785a8a34362947310d4f29bc7c3c604f82ab9e0cfea86&redirect_uri=https%3A%2F%2F10.13.4.6%2Fapi%2Fusers%2FLogin42%2F&response_type=code';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setErrorFields({ username: false, password: false, email: false });

    if (username.length > 10) {
      setError('Username must be less than 10 characters');
      setErrorFields((prev) => ({ ...prev, username: true }));
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setErrorFields((prev) => ({ ...prev, password: true }));
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (isLogin && email && !emailPattern.test(email)) {
      setError('Please enter a valid email');
      setErrorFields((prev) => ({ ...prev, email: true }));
      return;
    }
  
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, ''); 
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._-]/g, ''); 

    try {
      
      if (isLogin ) {
        const response1 = await checkotoptwo(sanitizedUsername, password);
        if( response1.data.message === 'B'){
        const response = await login(sanitizedUsername, password);
        if (response.data.message === 'Login successful') {
          router.push('/dashboard');
        }
        else
        {
          let fieldsWithErrors = { username: false, password: false, email: false };
            fieldsWithErrors.username = true;
            fieldsWithErrors.password = true;

          setError('Invalid username or password');
          setErrorFields(fieldsWithErrors);
        }
        }
        else if (response1.data.message === 'A') {
          setLoginOtp(sanitizedUsername, password);
          router.push('/otp');
        }
      }
      
       else {
        const res = await register(username, password, sanitizedEmail);
        if (res.status === 201) {
          setSuccessMessage('User created successfully');
        }
        else if (res.data.error)
        {
          setError(res.data.error);

        }
    
      }
   
    } catch (error: any) {
      let errorMsg = 'An error occurred';
      setError(errorMsg);
    }
  };

  useEffect(() => {
    const loginText = document.querySelector('.title-text .login') as HTMLElement | null;
    const loginForm = document.querySelector('form.login') as HTMLElement | null;
    const loginBtn = document.querySelector('label.login') as HTMLElement | null;
    const signupBtn = document.querySelector('label.signup') as HTMLElement | null;

    const handleSignupClick = () => {
      if (loginForm && loginText) {
        loginForm.style.marginLeft = '-50%';
        loginText.style.marginLeft = '-50%';
      }
      setIsLogin(false);
    };

    const handleLoginClick = () => {
      if (loginForm && loginText) {
        loginForm.style.marginLeft = '0%';
        loginText.style.marginLeft = '0%';
      }
      setIsLogin(true);
    };

    signupBtn?.addEventListener('click', handleSignupClick);
    loginBtn?.addEventListener('click', handleLoginClick);
    return () => {
      signupBtn?.removeEventListener('click', handleSignupClick);
      loginBtn?.removeEventListener('click', handleLoginClick);
    };
  }, []);

  return (
    <div className="home">
      <div className="title-text font-[walo]">
        <div className={`title login ${isLogin ? 'active' : ''}`}>Login</div>
        <div className={`title signup ${!isLogin ? 'active' : ''}`}>Sign up</div>
      </div>
      <div className="form-container font-[Montserrat]">
        <div className="slide-controls font-[hossine]">
          <input type="radio" name="slide" id="login" checked={isLogin} readOnly />
          <input type="radio" name="slide" id="signup" checked={!isLogin} readOnly />
          <label htmlFor="login" className={`slide login ${isLogin ? 'active' : ''}`}>
            Login
          </label>
          <label htmlFor="signup" className={`slide signup ${!isLogin ? 'active' : ''}`}>
            Signup
          </label>
          <div className="slider-tab"></div>
        </div>
        <div className={`form_login ${isLogin ? 'active' : ''}`}>
          <form onSubmit={handleSubmit} className="login">
            <div className="field">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ borderColor: errorFields.username ? 'red' : undefined }}
                className='bg-neutral-900 text-white rounded-xl p-2'
              />
            </div>
            <div className="field">
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderColor: errorFields.password ? 'red' : undefined }}
                className='bg-neutral-900 text-white rounded-xl p-2'
              />
            </div>
            <div className="forgot">
              <a href="/forgotten">Forgot password?</a>
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Login" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
            <div className="my-5 font-[walo]">
              or
            </div>

            </div>
          </form>

          <form onSubmit={handleSubmit} className="signup">
            <div className="field">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ borderColor: errorFields.username ? 'red' : undefined }}
                className='bg-neutral-900 text-white rounded-xl p-2'
              />
            </div>
            <div className="field">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderColor: errorFields.password ? 'red' : undefined }}
                className='bg-neutral-900 text-white rounded-xl p-2'
              />
            </div>
            <div className="field">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderColor: errorFields.email ? 'red' : undefined }}
                className='bg-neutral-900 text-white rounded-xl p-2'
              />
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Signup" className='text-purple-700' />
            </div>
          </form>

            
        </div>
      </div>
      {error && (
        <div
          ref={errorRef}
          className="error-message w-full text-red-500 font-[abelhid] flex justify-center mt-10"
        >
          {error}
        </div>
      )}
              <button className='bg-purple-100 w-full my-4 rounded-xl h-[3rem] text-black font-[walo] flex flex-row justify-center items-center gap-3 rounded-xs' onClick={LoginIntra} >
                login with <span >
                  <Image src="image.svg" alt="Discord" width={20} height={20} />
                </span>
              </button>
      {successMessage && (
        <div
          ref={successRef}
          className="success-message fixed top-5 right-5 bg-gradient-to-r from-green-900 to-purple-800 text-white p-3 rounded shadow-lg font-[hossine] opacity-90"
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default SignUp;
