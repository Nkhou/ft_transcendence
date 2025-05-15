import React from 'react'
import { Input } from 'postcss';
import axios from 'axios';
import Cookie from 'js-cookie';
import {api } from '@/app/services/api';

export const getuserstatus = async () => {

const token = Cookie.get('access');
if (!token) {
        throw new Error('No token found');
}
  try {
      const response  = await api.get('api/users/user/', {
          headers: { Authorization: `Bearer ${token}`},
        });
      return response.data;
  } catch (error) {
    console.clear();
  }
}


export const ForgotPassword = async (username: string, password: string) => {
    try {
        const response = await axios.post('api/users/reset-otp/', {
        username: username,
        password: password,
        });
        return response.data;
    } catch (error) {
        console.clear();
        throw error;
    }
    }