'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { fetchUserProfile } from '../../../../util/login/authSlice';
import styles from '../../../../styles/login/redirect.module.scss';

const RedirectClientComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

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
        console.error('소셜 로그인 리다이렉트 후 accessToken을 찾을 수 없습니다.');
        alert('로그인 과정에 문제가 발생했습니다.');
        router.replace('/login');
      }
    };

    handleLogin();
  }, [searchParams, dispatch, router]);

  // 실제 로직이 처리되는 동안 이 컴포넌트는 아무것도 렌더링하지 않아도 됩니다.
  // Suspense의 fallback이 대신 표시됩니다.
  return null;
};

export default RedirectClientComponent;