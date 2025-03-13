import React from 'react';
import styles from '../../../styles/postDetail/postDetail.module.scss';

const PostDetail = () => {
  return (
    <div className={styles.postDetail}>
      {/* 검색 바 */}
      <div className={styles.searchBar}>
        <input type="text" placeholder="여수" className={styles.searchInput} />
        <button className={styles.searchButton}>🔍</button>
      </div>

      <div className={styles.contentWrapper}>
        {/* 게시글 본문 */}
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

          {/* 댓글 섹션 */}
        </main>

        {/* 사이드바 */}
        <aside className={styles.sidebar}></aside>
      </div>
    </div>
  );
};

export default PostDetail;
