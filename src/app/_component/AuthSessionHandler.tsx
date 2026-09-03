'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchUserProfile } from '../../../util/login/authSlice';

const AuthSessionHandler = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!initialCheckDone) {
      setInitialCheckDone(true);
      dispatch(fetchUserProfile());
    }
  }, [initialCheckDone, dispatch]);

  return <>{children}</>;
};

export default AuthSessionHandler;