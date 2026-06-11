"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  createGroup,
  fetchUserGroups,
  CreateGroupPayload,
} from "../../../util/group/groupSlice";
import style from "../../../styles/group/groupPage.module.scss";

export default function GroupCreateModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGroupNameValid = groupName.trim().length > 0;

  const handleCreateGroup = async () => {
    if (!isGroupNameValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload: CreateGroupPayload = {
        groupName: groupName.trim(),
        description: description.trim(),
      };

      await dispatch(createGroup(payload)).unwrap();
      alert("그룹이 성공적으로 생성되었습니다!");
      dispatch(fetchUserGroups());

      onClose();
    } catch (err: any) {
      console.error(err);
      alert("그룹 생성 실패: " + (err || "알 수 없는 오류가 발생했습니다."));
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
