"use client";

import { useEffect, useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  clearNotices,
  createGroupNotice,
  fetchGroupNotices,
  CreateNoticePayload,
} from "../../../../util/group/groupSlice";

export default function GroupNoticeModal({
  onClose,
  groupName,
}: {
  onClose: () => void;
  groupName: string | string[] | undefined;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { notices, loading } = useSelector((state: RootState) => state.group);
  const [selectedNoticeIndex, setSelectedNoticeIndex] = useState<number | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (groupName) {
      dispatch(fetchGroupNotices(groupName as string));
    }
    return () => {
      dispatch(clearNotices());
    };
  }, [dispatch, groupName]);

  const handleCreateNotice = async () => {
    if (loading || !groupName) return;

    try {
      const payload: CreateNoticePayload = {
        groupName: groupName as string,
        title: title.trim(),
        content: content.trim(),
      };

      await dispatch(createGroupNotice(payload)).unwrap();
      alert("공지가 성공적으로 생성되었습니다!");
      dispatch(fetchGroupNotices(groupName as string));

      setTitle("");
      setContent("");
      setIsEditMode(false);
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
        {selectedNoticeIndex !== null ? (
          <>
            <div className={styles.modal_top}>
              <img
                src="/imgs/left-arrow.png"
                alt="left-arrow"
                onClick={() => setSelectedNoticeIndex(null)}
              />
              <h3>그룹 공지</h3>
              <button onClick={onClose}>×</button>
            </div>
            <div className={styles.modal_detail}>
              <div>
                <strong>{notices[selectedNoticeIndex].writerName}</strong>{" "}
                {notices[selectedNoticeIndex].title}
              </div>
              <div className={styles.modal_detail_content}>
                {notices[selectedNoticeIndex].content}
              </div>
            </div>
          </>
        ) : isEditMode ? (
          <>
            <div className={styles.modal_top}>
              <img
                src="/imgs/left-arrow.png"
                alt="left-arrow"
                onClick={() => setIsEditMode(false)}
              />
              <h3>그룹 공지</h3>
              <button onClick={onClose}>×</button>
            </div>
            <div className={styles.modal_detail}>
              <input
                className={styles.edit_title}
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className={styles.edit_content}
                placeholder="내용을 입력해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <button
              className={
                title.trim() && content.trim()
                  ? styles.edit_btn
                  : styles.edit_btn_disabled
              }
              disabled={loading || (!title.trim() && !content.trim())}
              onClick={handleCreateNotice}
            >
              등록하기
            </button>
          </>
        ) : (
          <>
            <div className={styles.modal_top}>
              <h3>그룹 공지</h3>
              <button onClick={onClose}>×</button>
            </div>
            <ul className={styles.modal_bottom}>
              {Array.isArray(notices) && notices.length > 0 ? (
                notices.map((notice: any, idx: number) => (
                  <li
                    key={notice.id}
                    onClick={() => setSelectedNoticeIndex(idx)}
                  >
                    <div>
                      <strong>{notice.writerName}</strong> {notice.title}
                    </div>
                    <img src="/imgs/right-arrow.png" alt="right-arrow" />
                  </li>
                ))
              ) : (
                <img
                  className={styles.group_modal_center}
                  src="/imgs/group_modal_center.png"
                  alt="group_modal"
                />
              )}
            </ul>
            <div className={styles.edit_box}>
              <img
                src="/imgs/edit.png"
                alt="edit"
                className={styles.edit_img}
                onClick={() => {
                  setIsEditMode(true);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
