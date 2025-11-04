'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { fetchUserProfile } from '../../../../util/login/authSlice';
import { getCookie } from 'cookies-next';

const RedirectClientComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let accessToken = searchParams.get('accessToken');
    let refreshToken = searchParams.get('refreshToken');

    if (!accessToken) {
      const cookieToken = getCookie('Authorization');
      if (typeof cookieToken === 'string') {
        accessToken = cookieToken;
      }
    }
    if (!refreshToken) {
      const cookieRefreshToken = getCookie('RefreshToken');
      if (typeof cookieRefreshToken === 'string') {
        refreshToken = cookieRefreshToken;
      }
    }

    const handleLogin = async () => {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        try {
          await dispatch(fetchUserProfile()).unwrap();
          router.replace('/main');
        } catch (error) {
          console.error('소셜 로그인 후 프로필 조회 실패:', error);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
          router.replace('/login');
        }
      } else {
        console.error('소셜 로그인 리다이렉트 후 토큰을 찾을 수 없습니다.');
        alert('로그인 과정에 문제가 발생했습니다.');
        router.replace('/login');
      }
    };

    handleLogin();
  }, []);

  return null;
};

export default RedirectClientComponent;