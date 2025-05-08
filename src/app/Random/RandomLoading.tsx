'use client';

import { motion } from 'framer-motion';
import styles from '../../../styles/Random/Random.module.scss';
import Image from 'next/image';
import { useMemo } from 'react';

const balls = [
  'redBall.png',
  'greenBall.png',
  'blueBall.png',
  'yellowBall.png',
];

const animationSettings = {
  y: [0, -12, 12, -6, 6, 0],
};

const transitionSettings = {
  duration: 1.5,
  ease: 'easeInOut',
  repeat: Infinity,
};

export default function RandomLoading() {
  const ballPositions = [
    { left: '120px', top: '130px' },
    { left: '150px', top: '130px' },
    { left: '120px', top: '165px' },
    { left: '150px', top: '165px' },
  ];

  // 🔧 transition 배열을 useMemo로 메모이제이션
  const transitions = useMemo(
    () =>
      balls.map((_, index) => ({
        ...transitionSettings,
        delay: index * 0.2,
      })),
    []
  );

  return (
    <div className={styles.machineContainer}>
      <Image
        src="/imgs/noBallChar.png"
        alt="가챠 머신 배경"
        width={300}
        height={360}
        className={styles.machineImage}
      />

      <div className={styles.ballsOverlay}>
        {balls.map((ball, index) => (
          <motion.div
            key={index}
            className={styles.ball}
            animate={animationSettings}
            transition={transitions[index]} // ✅ 메모이제이션된 transition 사용
            style={ballPositions[index]}
          >
            <Image
              src={`/imgs/${ball}`}
              alt={`ball-${index}`}
              width={30}
              height={30}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
