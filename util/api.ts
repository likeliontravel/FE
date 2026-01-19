import axios from 'axios';

const BASE_URL = 'https://api.toleave.shop';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const cleanedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      config.headers.Authorization = `Bearer ${cleanedToken}`;
    }
  }
  return config;
});

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});