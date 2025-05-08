'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import styles from '../../../styles/RandomHome/RandomHome.module.scss';

export default function Home() {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push('/Random');
  }, [router]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h2 className={styles.smallTitle}>랜덤 여행지 추천</h2>
        <h1 className={styles.title}>랜덤으로 여행지를 뽑아드려요</h1>
        <p className={styles.description}>
          여행지가 고민된다면 랜덤 여행지 추천 기능으로 <br />
          새로운 여행을 떠나보세요!
        </p>
        <img
          src="/imgs/RandomButton.png"
          alt="보러가기 버튼"
          className={styles.button}
          onClick={handleClick}
        />
      </div>
      <div className={styles.imageBox}>
        <img
          src="/imgs/RandomChar.png"
          alt="캐릭터"
          className={styles.character}
        />
      </div>
    </div>
  );
}
