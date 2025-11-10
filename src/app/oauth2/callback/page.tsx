'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { socialLoginUser } from '../../../../util/login/authSlice';

function SocialCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const provider = pathSegments[pathSegments.length - 1];
    const code = searchParams.get('code');

    const handleLogin = async () => {
      if (provider && code) {
        try {
          const user = await dispatch(socialLoginUser({ provider, code })).unwrap();
          alert(`${user.name}님, 환영합니다!`);
          router.replace('/main');
        } catch (error) {
          console.error('소셜 로그인 처리 실패:', error);
          alert('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
          router.replace('/login');
        }
      } else {
        alert('소셜 로그인 정보가 올바르지 않습니다.');
        router.replace('/login');
      }
    };

    handleLogin();
  }, [dispatch, router, searchParams]);

  return <div style={{ textAlign: 'center', padding: '50px' }}>소셜 로그인 처리 중입니다...</div>;
}

export default function SocialCallbackPage() {
  return (
    <Suspense>
      <SocialCallback />
    </Suspense>
  );
}