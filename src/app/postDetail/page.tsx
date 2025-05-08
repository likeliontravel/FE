'use client';

import React, { useState, useCallback } from 'react';
import styles from '../../../styles/postDetail/postDetail.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import { useRouter } from 'next/navigation';

const regionKeywords = ['서울', '부산', '제주', '여수'];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

const PostDetail = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');

  const handleKeywordClick = useCallback(
    (keyword: string) => () => {
      setSearchTerm(keyword);
    },
    []
  );

  const handleTabClick = useCallback(
    (tab: '지역' | '테마') => () => {
      setActiveTab(tab);
    },
    []
  );

  const goToPostWrite = useCallback(() => {
    router.push('/postWrite');
  }, [router]);

  // ✅ 탭에 따라 다른 키워드 배열 보여주기
  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  return (
    <div className={styles.postDetail}>
      {/* 검색창 */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className={styles.contentWrapper}>
        {/* 본문 영역 */}
        <main className={styles.mainContent}>
          <h1 className={styles.title}>
            여수 1박2일 여행 후기 + 숙소 꿀팁 전수해요 🙌
          </h1>

          <div className={styles.metaInfo}>
            <span className={styles.category}>여행</span>
          </div>

          <img
            src="/images/travel-yeosu.jpg"
            alt="여수 여행"
            className={styles.mainImage}
          />

          <p className={styles.postContent}>
            오동도에서 특별한 구경하고, 저녁엔 케이블카 타고 여수 밤바다
            구경했어요! 특히 케이블카를 타고 내려다본 야경은 꼭 보셔야 합니다.
            <br />
            <br />
            숙소는 **OO리조트** 추천! 뷰가 정말 끝내줘요~ 😊 바로 예약 링크도
            있으니 참고하세요.
          </p>
        </main>

        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          {/* 프로필 카드 */}
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
              <button onClick={goToPostWrite}>
                <img src="/imgs/writing.png" alt="글쓰기" />
                글쓰기
              </button>
              <button>
                <img src="/imgs/myposts.png" alt="내 글" />내 글보기
              </button>
            </div>
          </div>

          {/* 카테고리 영역 */}
          <div className={styles.categoryContainer}>
            <div className={styles.categoryTabs}>
              <span
                className={`${styles.categoryTab} ${activeTab === '지역' ? styles.active : ''}`}
                onClick={handleTabClick('지역')}
              >
                지역
              </span>
              <span
                className={`${styles.categoryTab} ${activeTab === '테마' ? styles.active : ''}`}
                onClick={handleTabClick('테마')}
              >
                테마
              </span>
            </div>

            {/* ✅ 탭에 따라 키워드 변경 */}
            <div className={styles.categoryItems}>
              {currentKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className={styles.categoryItem}
                  onClick={handleKeywordClick(keyword)}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetail;

// 파일 구조를 동적 세그먼트를 지원하도록 바꿉니다
