'use client';
import { useState } from 'react';
import styles from './GuideOverlay.module.scss';
import GuideCalendar from './GuideCalendar.tsx';
import RegionSelector from './RegionSelector';
import Together from './Together.tsx';
import ThemeSelector from './ThemeSelector';

const guideSteps = [
  { title: 'STEP 1. 여행 일정', description: '여행 기간을 선택해주세요' },
  {
    title: 'STEP 2. 여행 일행',
    description: '누구와 함께 떠나시나요?',
  },
  {
    title: 'STEP 3. 여행 지역',
    description: (
      <>
        어디로
        <br />
        떠나시나요?
      </>
    ),
  },
  {
    title: 'STEP 4. 여행 테마',
    description: '어떤 테마를 선호하나요?',
  },
];

function GuideStepContent({ stepIdx }) {
  switch (stepIdx) {
    case 0:
      return <GuideCalendar />;
    case 1:
      return <Together />;
    case 2:
      return <RegionSelector />;
    case 3:
      return <ThemeSelector />;
    default:
      return null;
  }
}

export default function GuideOverlay({ onClose }) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = guideSteps[stepIdx];

  const next = () => {
    if (stepIdx < guideSteps.length - 1) setStepIdx(stepIdx + 1);
    else onClose();
  };
  const prev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  return (
    <div className={styles.slideContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${((stepIdx + 1) / guideSteps.length) * 100}%` }}
        />
      </div>
      <div>
        <h2 className={styles.title}>{step.title}</h2>
        <p className={styles.desc}>{step.description}</p>
      </div>
      <div className={styles.controls}>
        {stepIdx > 0 && (
          <button onClick={prev} className={styles.btn_left}></button>
        )}
        <button onClick={next} className={styles.btn_right}></button>
      </div>
      <GuideStepContent stepIdx={stepIdx} />
    </div>
  );
}
