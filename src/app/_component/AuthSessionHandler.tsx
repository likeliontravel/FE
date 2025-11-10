'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { setUser } from '../../../util/login/authSlice';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number; sub: string; auth: string; name: string; exp: number;
}

// 순수 자바스크립트로 쿠키를 읽는 헬퍼 함수
function getCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

const AuthSessionHandler = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('accessToken') || getCookieValue('Authorization');

      if (typeof token === 'string') {
        try {
          const cleanedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
          const decoded: DecodedToken = jwtDecode(cleanedToken);
          if (decoded.exp * 1000 < Date.now()) { throw new Error('Token expired'); }
          const userProfile = {
            id: decoded.id, email: decoded.sub, name: decoded.name, role: decoded.auth,
            policy: false, subscribe: false, password: null
          };
          dispatch(setUser(userProfile));
        } catch (error) {
          console.error('AuthSessionHandler: 토큰 복구 실패', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
  }, [dispatch, user]);

  return <>{children}</>;
};

export default AuthSessionHandler;