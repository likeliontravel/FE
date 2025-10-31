import React, { Suspense } from 'react';
import RedirectClientComponent from './RedirectClientComponent';
import styles from '../../../../styles/login/redirect.module.scss';

const RedirectPage = () => {
  return (
    <div className={styles.container}>
      <Suspense fallback={<p>로그인 중입니다. 잠시만 기다려주세요...</p>}>
        <RedirectClientComponent />
      </Suspense>
    </div>
  );
};

export default RedirectPage;