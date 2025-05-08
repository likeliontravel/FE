'use client';

import React, { useState, useCallback } from 'react';
import styles from '../../../styles/postWrite/postWrite.module.scss';

const WritePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
  );

  return (
    <div className={styles.writePage}>
      <div className={styles.container}>
        <main className={styles.editorContainer}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="여수"
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>🔍</button>
          </div>

          <div className={styles.editor}>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={title} // title 상태를 바인딩하여 경고 해결
              onChange={handleTitleChange}
            />
            <textarea
              className={styles.contentInput}
              placeholder="오늘은 어떤 즐거운 여정을 떠났나요?"
              value={content}
              onChange={handleContentChange}
            />
          </div>

          <button className={styles.submitButton}>등록하기</button>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <img
              src="/images/profile.png"
              alt="profile"
              className={styles.profileImage}
            />
            <p className={styles.username}>린님</p>
            <div className={styles.profileActions}>
              <button>
                <img src="/imgs/Popular.png" alt="인기글" />
                인기글 보기
              </button>
              <button>
                <img src="/imgs/writing.png" alt="글쓰기" />
                글쓰기
              </button>
              <button>
                <img src="/imgs/myposts.png" alt="내 글보기" />내 글보기
              </button>
            </div>
          </div>
          <div className={styles.categoryContainer}>
            <div className={styles.categoryTabs}>
              <span className={`${styles.categoryTab} ${styles.active}`}>
                지역
              </span>
              <span className={styles.categoryTab}>테마</span>
            </div>
            <div className={styles.categoryItems}>
              {['서울', '부산', '제주', '여수'].map((region, index) => (
                <span key={index} className={styles.categoryItem}>
                  {region}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WritePage;
