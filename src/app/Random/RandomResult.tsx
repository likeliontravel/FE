'use client';

import { motion } from 'framer-motion';
import styles from '../../../styles/Random/Random.module.scss';
import { useEffect, useState, useMemo } from 'react';

export default function RandomResult({
  travel,
}: {
  travel: { name: string; image: string };
}) {
  const [showResult, setShowResult] = useState(false);

  const imageMap: { [key: string]: string } = {
    제주도: '/imgs/jejuResult.png',
    부산: '/imgs/busanResult.png',
    경주: '/imgs/gyeongjuResult.png',
    강릉: '/imgs/gangneungResult.png',
    여수: '/imgs/yeosuResult.png',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const travelName = travel.name.trim();
  const matchedKey = Object.keys(imageMap).find((key) => travelName === key);
  const imageUrl = matchedKey ? imageMap[matchedKey] : '/imgs/default.png';

  // ⚙️ ESLint 오류 해결: useMemo로 객체 고정
  const motionInitial = useMemo(() => ({ opacity: 0, scale: 0.8 }), []);
  const motionAnimate = useMemo(() => ({ opacity: 1, scale: 1 }), []);
  const motionTransition = useMemo(() => ({ duration: 0.6 }), []);

  return (
    <div className={styles.resultContainer}>
      {showResult && (
        <motion.div
          className={styles.result}
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
        >
          <img
            src={imageUrl}
            alt={travel.name}
            className={styles.resultImage}
          />
        </motion.div>
      )}
    </div>
  );
}
