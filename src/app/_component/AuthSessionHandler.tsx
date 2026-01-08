'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchUserProfile } from '../../../util/login/authSlice';
import { getCookie } from 'cookies-next';

const AuthSessionHandler = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);
  
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!user && !hasChecked) {
      setHasChecked(true);

      const token = getCookie('Authorization');
      if (token) {
        dispatch(fetchUserProfile());
      }
    }
  }, [dispatch, user, hasChecked]);

  return <>{children}</>;
};

export default AuthSessionHandler;