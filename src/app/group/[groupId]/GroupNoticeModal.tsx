"use client";

import { useState } from "react";
import styles from "../../../../styles/group/groupDetail.module.scss";

export default function GroupNoticeModal({ onClose }: { onClose: () => void }) {
  const [selectedNoticeIndex, setSelectedNoticeIndex] = useState<number | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const notices: any[] = [];

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
                <strong>{notices[selectedNoticeIndex].author}</strong>{" "}
                {notices[selectedNoticeIndex].content}
              </div>
              <div className={styles.modal_detail_content}>
                낼 날씨 많이 추우니 다들 따뜻한 옷차림으로 입구 오시오
                영하랍니다...{" "}
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
              />
              <textarea
                className={styles.edit_content}
                placeholder="내용을 입력해주세요"
              />
            </div>
            <button className={styles.edit_btn}>등록하기</button>
          </>
        ) : (
          <>
            <div className={styles.modal_top}>
              <h3>그룹 공지</h3>
              <button onClick={onClose}>×</button>
            </div>
            <ul className={styles.modal_bottom}>
              {notices.length > 0 ? (
                notices.map((notice, index) => (
                  <li key={index} onClick={() => setSelectedNoticeIndex(index)}>
                    <div>
                      <strong>{notice.author}</strong> {notice.content}
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
