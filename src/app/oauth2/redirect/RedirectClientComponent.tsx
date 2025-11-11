'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { fetchUserProfile } from '../../../../util/login/authSlice';

const RedirectClientComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const user = await dispatch(fetchUserProfile()).unwrap();

        alert(`${user.name}님, 환영합니다!`);
        router.replace('/main');

      } catch (error) {
        console.error('소셜 로그인 후 프로필 조회 실패:', error);
        alert('로그인에 실패했습니다. 사용자 정보를 가져올 수 없습니다.');
        router.replace('/login');
      }
    };

    const timer = setTimeout(() => {
      handleLogin();
    }, 100);

    return () => clearTimeout(timer);
    
  }, [dispatch, router]);

  return <div style={{ textAlign: 'center', padding: '50px' }}>로그인 정보를 확인 중입니다...</div>;
};

export default RedirectClientComponent;