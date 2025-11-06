'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchUserProfile } from '../../../util/login/authSlice';
import { getCookie } from 'cookies-next';

const AuthSessionHandler = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || getCookie('Authorization');

    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  return <>{children}</>;
};

export default AuthSessionHandler;