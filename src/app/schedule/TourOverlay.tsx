'use client';

import styles from './TourOverlay.module.css';

export default function TourOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      {/* STEP 1 */}
      <div className={`${styles.tooltip} ${styles.step1}`}>
        <div className={styles.label}>STEP.1</div>
        <div className={styles.text}>
          일정 생성에 필요한 지역과 기간을 선택하세요.
        </div>
      </div>
      {/* STEP 2 */}
      <div className={`${styles.tooltip} ${styles.step2}`}>
        <div className={styles.label}>STEP.2</div>
        <div className={styles.text}>
          원하는 시간대 영역을 클릭해 일정을 지정하세요.
        </div>
      </div>
      {/* STEP 3 */}
      <div className={`${styles.tooltip} ${styles.step3}`}>
        <div className={styles.label}>STEP.3</div>
        <div className={styles.text}>
          맛집/숙소 정보가 여기 표시됩니다. 드래그해 추가하세요.
        </div>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        확인
      </button>
    </div>
  );
}
