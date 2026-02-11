"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  clearInviteLink,
  fetchGroupInvitation,
  generateGroupInvitation,
} from "../../../../util/group/groupSlice";

export default function GroupInviteModal({
  onClose,
  groupName,
}: {
  onClose: () => void;
  groupName: string | string[] | undefined;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { inviteLink, loading } = useSelector(
    (state: RootState) => state.group,
  );
  const [copyStatus, setCopyStatus] = useState<null | "success" | "fail">(null);

  useEffect(() => {
    if (groupName) {
      dispatch(fetchGroupInvitation(groupName as string));
    }
    return () => {
      dispatch(clearInviteLink());
    };
  }, [dispatch, groupName]);

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyStatus("success");
    } catch (err) {
      setCopyStatus("fail");
    }
  };

  const handleCreateInvitation = async () => {
    if (loading || !groupName) return;

    try {
      await dispatch(generateGroupInvitation(groupName as string)).unwrap();

      alert("초대 링크가 성공적으로 생성되었습니다!");
    } catch (err: any) {
      console.error(err);
      alert(err || "요청 중 오류가 발생했습니다.");
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
            value={inviteLink || ""}
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
