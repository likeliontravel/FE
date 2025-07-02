"use client";

import { useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";

export default function GroupInviteModal({ onClose }: { onClose: () => void }) {
  const [copyStatus, setCopyStatus] = useState<null | "success" | "fail">(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("https://invite.link/example");
      setCopyStatus("success");
    } catch (err) {
      setCopyStatus("fail");
    }
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal_top}>
          <h3>멤버 초대</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className={styles.modal_link}>
          <p>초대링크 생성</p>
          <img src="/imgs/plus_group.png" alt="plus_group" />
        </div>
        <div className={styles.modal_input}>
          <input type="text" placeholder="초대링크를 생성하세요" disabled />
          <button>복사하기</button>
        </div>
        {copyStatus === "success" ? (
          <span className={styles.copy_success}>
            <img src="/imgs/check.png" alt="check" />
            클립보드에 복사되었어요
          </span>
        ) : (
          <span className={styles.copy_default}>
            초대링크는 생성 후 1일까지 유효해요!
          </span>
        )}
      </div>
    </div>
  );
}
