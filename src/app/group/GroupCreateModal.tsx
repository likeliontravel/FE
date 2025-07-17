"use client";

import { useState } from "react";
import style from "../../../styles/group/groupPage.module.scss";

export default function GroupCreateModal({ onClose }: { onClose: () => void }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGroupNameValid = groupName.trim().length > 0;

  const handleCreateGroup = async () => {
    if (!isGroupNameValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/group/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          description: description.trim(),
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert("그룹이 성공적으로 생성되었습니다!");
        onClose();
      } else {
        alert("그룹 생성 실패: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.modal_backdrop} onClick={onClose}>
      <div
        className={style.modal_container}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={style.modal_title}>그룹 생성하기</p>

        <label>
          그룹명<span>*</span>
        </label>
        <input
          type="text"
          placeholder="그룹명을 입력해주세요"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <label>그룹 소개</label>
        <textarea
          placeholder="그룹에 대한 간단한 소개 메시지를 적어주세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className={
            isGroupNameValid ? style.create_button_active : style.create_button
          }
          disabled={!isGroupNameValid || isSubmitting}
          onClick={handleCreateGroup}
        >
          생성하기
        </button>
      </div>
    </div>
  );
}
