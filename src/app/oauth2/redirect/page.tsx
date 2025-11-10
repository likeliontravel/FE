import React, { Suspense } from 'react';
import RedirectClientComponent from './RedirectClientComponent';

const RedirectPage = () => {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>로그인 정보를 확인 중입니다...</div>}>
      <RedirectClientComponent />
    </Suspense>
  );
};

export default RedirectPage;