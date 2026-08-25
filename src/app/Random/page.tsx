'use client';

import { useState, useEffect, useCallback } from 'react';
import RandomLoading from './RandomLoading';
import RandomResult from './RandomResult';
import Image from 'next/image';
import { motion, Transition } from 'framer-motion';
import styles from '../../../styles/Random/Random.module.scss';

const travelDestinations = [
  { name: '제주도', image: '/imgs/jejuResult.png' },
  { name: '부산', image: '/imgs/busanResult.png' },
  { name: '강릉', image: '/imgs/gangneungResult.png' },
  { name: '여수', image: '/imgs/yeosuResult.png' },
  { name: '경주', image: '/imgs/gyeongjuResult.png' },
];

const ballInitial = { y: -40, opacity: 0, scale: 0.7 };
const ballAnimate = { y: 150, opacity: 1, scale: 1 };

const ballTransition: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 24,
};

const ballStyle = { cursor: 'pointer' };

export default function RandomTravelPicker() {
  const [travel, setTravel] = useState<{ name: string; image: string } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const pickRandomTravel = useCallback(() => {
    setRolling(true);
    setTravel(null);
    setResultReady(false);
    setShowResult(false);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * travelDestinations.length);
      setTravel(travelDestinations[randomIndex]);
      setRolling(false);
      setResultReady(true);
    }, 1800);
  }, []);

  useEffect(() => {
    pickRandomTravel();
  }, [pickRandomTravel]);

  const handlePickRandomTravel = useCallback(() => {
    pickRandomTravel();
  }, [pickRandomTravel]);

  const handleDropComplete = useCallback(() => {
    setTimeout(() => {
      setShowResult(true);
    }, 80);
  }, []);

  const SelectedBallDrop = () => (
    <div className={styles.machineBox}>
      <motion.div
        className={styles.selectedBall}
        initial={ballInitial}
        animate={ballAnimate}
        transition={ballTransition}
        onAnimationComplete={handleDropComplete} // 착지 즉시 자동 개봉
        onClick={() => setShowResult(true)}      // 클릭 시에도 즉시 개봉
        style={ballStyle}
      >
        <Image
          src="/imgs/selected-ball.png"
          alt="선택된 공"
          width={70}
          height={70}
        />
      </motion.div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageTitleWrapper}>
        <div className={styles.ballWrapper}>
          <Image
            src="/imgs/blueBall.png"
            alt="파란 공"
            width={20}
            height={20}
            className={styles.titleBall}
          />
        </div>
        <h2 className={styles.title}>무슨 여행지가 나올까요?</h2>
      </div>

      {rolling && <RandomLoading />}
      {!rolling && resultReady && !showResult && <SelectedBallDrop />}
      {!rolling && showResult && travel && <RandomResult travel={travel} />}

      {!rolling && showResult && travel && (
        <button className={styles.retryButton} onClick={handlePickRandomTravel}>
          다시 뽑기
        </button>
      )}
    </div>
  );
}