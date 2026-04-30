import axios from 'axios';

// 기존에 사용하던 BASE_URL (도메인은 .cloud로 업데이트 필요)
const BASE_URL = 'https://api.toleave.cloud';

export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 바로 이 인터셉터 부분이 무한 루프의 주범일 가능성이 큽니다!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 에러가 발생하면
    if (error.response && error.response.status === 401) {

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);