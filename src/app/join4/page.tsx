'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/join4/join4.module.scss';

const Welcome = () => {
  const router = useRouter();

  const goToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <p className={styles.userName}>린님</p>
          <h2 className={styles.title}>
            투리브에 오신걸 <br />
            환영해요!
          </h2>
          <p className={styles.description}>
            투리브와 함께 즐거운 일정을 계획해볼까요?
          </p>
          <button className={styles.startButton} onClick={goToLogin}>
            시작하기 &gt;
          </button>
        </div>

        <div className={styles.imageContainer}>
          <img
            src="/imgs/welcome_character.png"
            alt="투리브 캐릭터"
            className={styles.characterImage}
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
