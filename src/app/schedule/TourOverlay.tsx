"use client";

import styles from "./TourOverlay.module.css";

interface TourOverlayProps {
  onClose: () => void;
}

export default function TourOverlay({ onClose }: TourOverlayProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <img
        src="/imgs/guide_overlay.png"
        alt="서비스 이용 가이드"
        className={styles.guideImg}
        onClick={(e) => e.stopPropagation()}
      />

      <button
        className={styles.closeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        확인
      </button>
    </div>
  );
}
