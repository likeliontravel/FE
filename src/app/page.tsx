'use client';

import React, { useCallback } from 'react';

const Login: React.FC = () => {
  const link = '링크 여기에 넣어서 쓰세요';

  const loginHandler = useCallback(() => {
    window.location.href = link;
  }, [link]);

  return (
    <button type="button" onClick={loginHandler}>
      카카오톡으로 시작하기
    </button>
  );
};

export default Login;
