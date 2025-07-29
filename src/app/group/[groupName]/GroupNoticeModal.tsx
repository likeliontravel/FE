"use client";

import { useEffect, useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";

export default function GroupNoticeModal({
  onClose,
  groupName,
}: {
  onClose: () => void;
  groupName: string | string[] | undefined;
}) {
  const [selectedNoticeIndex, setSelectedNoticeIndex] = useState<number | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notices, setNotices] = useState<any | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(
          `https://localhost:8080/group/announcement/getAllAnnouncement?groupName=${groupName}`
        );
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setNotices(json.data);
        }
      } catch (error) {
        console.error("공지 정보 불러오기 실패:", error);
      }
    };

    fetchNotice();
  }, []);

  const handleCreateNotice = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await fetch(
        "https://localhost:8080/group/announcement/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupName: groupName,
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        alert("공지가 성공적으로 생성되었습니다!");
        onClose();
      } else {
        alert("공지 생성 실패: " + result.message);
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
              className={styles.edit_btn}
              disabled={isSubmitting}
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
              {notices.length > 0 ? (
                notices.map((notice: any) => (
                  <li
                    key={notice.id}
                    onClick={() => setSelectedNoticeIndex(notice.id - 1)}
                  >
                    <div>
                      <strong>{notice.writerName}</strong> {notice.title}
                    </div>
                    <img src="/imgs/right-arrow.png" alt="right-arrow" />
                  </li>
                ))
              ) : (
                <img src="/imgs/group_modal_center.png" alt="group_modal" />
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
