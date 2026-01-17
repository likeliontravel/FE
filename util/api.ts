import axios from 'axios';

export const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const cleanedToken = token.startsWith('Bearer ')
        ? token.split(' ')[1]
        : token;
      config.headers.Authorization = `Bearer ${cleanedToken}`;
    }
  }
  return config;
});

export const publicApi = axios.create({
  withCredentials: true,
});
