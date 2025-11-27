import styles from "./ScheduleModal.module.scss";

export default function ScheduleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>그룹 일정 관리</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className={styles.actions}>
          <button className={styles.add}>+ 추가</button>
          <button className={styles.delete}>− 삭제</button>
        </div>

        <div className={styles.list}>
          {[1, 2, 3, 4, 5].map((_, idx) => (
            <div key={idx} className={styles.item}>
              <div className={styles.badge}>멋사</div>
              <span>속초 여행</span>
              <span className={styles.day}>D-21</span>
              <button className={styles.edit}>수정</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
