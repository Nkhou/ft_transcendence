import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string, days: number = 9) => {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
 
};


export const getCookie = (key: string) => {
  return document.cookie.split(';').find((cookie) => cookie.trim().startsWith(`${key}=`));
}

export const removeCookie = (key: string) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}