'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { setUser } from '../../../../util/login/authSlice';
import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  sub: string;
  auth: string;
  name: string;
  exp: number;
  userIdentifier?: string;
}

const RedirectClientComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const accessToken = getCookie('Authorization');
    const refreshToken = getCookie('RefreshToken');

    const handleLogin = () => {
      if (typeof accessToken === 'string') {
        const cleanedToken = accessToken.startsWith('Bearer ') ? accessToken.split(' ')[1] : accessToken;
        
        localStorage.setItem('accessToken', cleanedToken);
        if (typeof refreshToken === 'string') {
          const cleanedRefreshToken = refreshToken.startsWith('Bearer ') ? refreshToken.split(' ')[1] : refreshToken;
          localStorage.setItem('refreshToken', cleanedRefreshToken);
        }

        try {
          const decoded: DecodedToken = jwtDecode(cleanedToken);
          
          const userProfile = {
            id: decoded.id,
            email: decoded.sub,
            name: decoded.name,
            userIdentifier: decoded.userIdentifier || decoded.sub,
            role: decoded.auth,
            policy: false,
            subscribe: false,
            password: null
          };
          
          dispatch(setUser(userProfile));
          
          router.replace('/main');

        } catch (error) {
          console.error('소셜 로그인 처리 중 토큰 디코딩 실패:', error);
          alert('로그인에 실패했습니다. 토큰이 유효하지 않습니다.');
          router.replace('/login');
        }
      } else {
        console.error('소셜 로그인 리다이렉트 후 쿠키에서 토큰을 찾을 수 없습니다.');
        alert('로그인 과정에 문제가 발생했습니다.');
        router.replace('/login');
      }
    };

    handleLogin();
  }, []); 

  return null;
};

export default RedirectClientComponent;