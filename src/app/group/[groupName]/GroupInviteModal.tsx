"use client";

import { useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";

export default function GroupInviteModal({
  onClose,
  groupName,
}: {
  onClose: () => void;
  groupName: string | string[] | undefined;
}) {
  const [copyStatus, setCopyStatus] = useState<null | "success" | "fail">(null);
  const [inviteLink, setInviteLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyStatus("success");
    } catch (err) {
      setCopyStatus("fail");
    }
  };

  const handleCreateInvitation = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await fetch(
        `https://localhost:8080/${groupName}/invitation/generateNew`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        const link = result.data?.invitationCode;
        setInviteLink(link);
        alert("초대 링크가 성공적으로 생성되었습니다!");
      } else {
        alert("초대 링크 생성 실패: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
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
          <img
            src="/imgs/plus_group.png"
            alt="plus_group"
            onClick={handleCreateInvitation}
          />
        </div>
        <div className={styles.modal_input}>
          <input
            type="text"
            placeholder="초대링크를 생성하세요"
            value={inviteLink}
            disabled
            readOnly
          />
          <button onClick={handleCopy} disabled={!inviteLink}>
            복사하기
          </button>
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
