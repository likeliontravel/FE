'use client';

import { motion, Transition } from 'framer-motion';
import styles from '../../../styles/Random/Random.module.scss';
import { useMemo } from 'react';

export default function RandomResult({
  travel,
}: {
  travel: { name: string; image: string };
}) {
  const imageMap: { [key: string]: string } = {
    제주도: '/imgs/jejuResult.png',
    부산: '/imgs/busanResult.png',
    경주: '/imgs/gyeongjuResult.png',
    강릉: '/imgs/gangneungResult.png',
    여수: '/imgs/yeosuResult.png',
  };

  const travelName = travel.name.trim();
  const matchedKey = Object.keys(imageMap).find((key) => travelName === key);
  const imageUrl = matchedKey ? imageMap[matchedKey] : '/imgs/default.png';

  const motionInitial = useMemo(() => ({ opacity: 0, scale: 0.4 }), []);
  const motionAnimate = useMemo(() => ({ opacity: 1, scale: 1 }), []);

  const motionTransition = useMemo(
    (): Transition => ({
      type: 'spring',
      stiffness: 380,
      damping: 22,
    }),
    []
  );

  return (
    <div className={styles.resultContainer}>
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
    </div>
  );
}