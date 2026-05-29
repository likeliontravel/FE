"use client";

import styles from "./TourOverlay.module.css";

interface TourOverlayProps {
  onClose: () => void;
}

export default function TourOverlay({ onClose }: TourOverlayProps) {
  return (
    <div className={styles.overlay}>
      {/* STEP 1 */}
      <div className={`${styles.tooltip} ${styles.step1}`}>
        <div className={styles.label}>STEP.1</div>
        <div className={styles.text}>드롭다운에서 원하는 일정을 선택하세요</div>
      </div>
      {/* STEP 2 */}
      <div className={`${styles.tooltip} ${styles.step2}`}>
        <div className={styles.label}>STEP.2</div>
        <div className={styles.text}>
          맛집,숙소,관광지 중 카테고리를 선택하고 지역,테마(관광지 한정)를
          선택하신 후 돋보기를 눌러주세요
        </div>
      </div>
      {/* STEP 3 */}
      <div className={`${styles.tooltip} ${styles.step3}`}>
        <div className={styles.label}>STEP.3</div>
        <div className={styles.text}>
          일정박스를 열어 시간대 선택 후 조회된 데이터를 클릭해 추가해서 넣고
          일정을 저장하세요
        </div>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        확인
      </button>
    </div>
  );
}
