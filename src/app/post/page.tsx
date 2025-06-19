'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../styles/post/postList.module.scss';
import SearchBar from '../SearchBar/SearchBar';

interface PostType {
  id: number;
  title: string;
  writer: string;
  content: string;
  image: string;
}

const testPosts: PostType[] = [
  {
    id: 1,
    title: '여수 당일치기 여행 후기 + 숙소 꿀팁 전수해요🙌',
    writer: '여정',
    content:
      '오동도에서 동백꽃 구경하고, 저녁엔 케이블카 타고 여수 밤바다 구경했어요! 밤이 되니까 반짝이는 조명들이 더 이쁜 느낌.. 특히 케이블카를 타고 내려다본 야경은 꼭 보시는걸 추천..! 근처 카페에서 따뜻한 커피 한 잔 마시면서 바라본 바다도 한껏 닮았습니다.. 이런 곳이라면 하루 종일 있어도 지루하지 않을 것 같아요!*´-`v 저희는 숙소의 경우 아고다...',
    image: '/imgs/sample1.png',
  },
  {
    id: 2,
    title: '올만에 가족들과 여수에서 보내는 여유로운 하루',
    writer: '토리',
    content:
      '여수에 오면 여유가 가득해지는 것 같아요. 이번엔 낮엔 오동도에서 자연을 즐기고, 밤엔 카페에서 여수 밤바다를 바라보며..',
    image: '/imgs/sample2.jpg',
  },
  {
    id: 3,
    title: '여수 바다와 산책로를 따라',
    writer: '푸른하늘',
    content:
      '아름다운 해안선을 따라 걷는 것만으로도 힐링이 되는 시간이었어요. 잠시 복잡한 일상에서 벗어나..',
    image: '/imgs/sample3.jpg',
  },
  {
    id: 4,
    title: '여수 밤바다의 낭만, 그리고 맛집 탐방',
    writer: '미식가',
    content:
      '여수에 도착하자마자 돌산대교를 건너 바로 케이블카를 탔어요. 그림 같았던 노을과 야경이 아직도 생생합니다. 저녁엔..',
    image: '/imgs/sample4.png',
  },
];

const regionKeywords = [
  '서울',
  '인천',
  '대전',
  '대구',
  '광주',
  '부산',
  '울산',
  '경기',
  '강원',
  '충북',
  '충남',
  '세종',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '가평',
  '양양',
  '강릉',
  '경주',
  '전주',
  '여수',
  '춘천',
  '홍천',
  '태안',
  '통영',
  '거제',
  '포항',
  '안동',
];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

const PostList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('popular');
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [activeRegion, setActiveRegion] = useState('서울');
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    setPosts(testPosts);
  }, []);

  const handleKeywordClick = (keyword: string) => () => {
    setActiveRegion(keyword);
    setSearchTerm(keyword);
  };

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortOrder(e.target.value);
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

  const filteredPosts = posts
    .filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (sortOrder === 'popular' ? b.id - a.id : a.id - b.id));

  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </section>

        <div className={styles.mainWrapper}>
          <main className={styles.mainContent}>
            <div className={styles.sortOptions}>
              <select
                value={sortOrder}
                onChange={handleSortChange}
                className={styles.sortSelect}
              >
                <option value="popular">인기순</option>
                <option value="recent">최신순</option>
              </select>
            </div>
            <div className={styles.postList}>
              {filteredPosts.map((post) => (
                <Link
                  href={`/posts/${post.id}`}
                  key={post.id}
                  className={styles.postItemLink}
                >
                  <div className={styles.postItem}>
                    <div className={styles.postTextContent}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <div className={styles.postMeta}>
                        <div className={styles.authorAvatar}></div>
                        <span className={styles.authorName}>{post.writer}</span>
                      </div>
                      <p className={styles.postExcerpt}>{post.content}</p>
                    </div>
                    <img
                      src={post.image}
                      alt={post.title}
                      className={styles.postImage}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <img
                  src="/imgs/Ellipse5.png"
                  alt="profile"
                  className={styles.profileImage}
                />
                <p className={styles.username}>린님</p>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button>
                  <img src="/imgs/Popular.png" alt="인기글" />
                  <span>인기글 보기</span>
                </button>
                <button onClick={goToPostWrite}>
                  <img src="/imgs/writing.png" alt="글쓰기" />
                  <span>글쓰기</span>
                </button>
                <button>
                  <img src="/imgs/myposts.png" alt="내 글" />
                  <span>내 글보기</span>
                </button>
              </div>
            </div>
            <div className={styles.categoryContainer}>
              <div className={styles.categoryTabs}>
                <button
                  className={`${styles.categoryTab} ${
                    activeTab === '지역' ? styles.active : ''
                  }`}
                  onClick={handleTabClick('지역')}
                >
                  지역
                </button>
                <button
                  className={`${styles.categoryTab} ${
                    activeTab === '테마' ? styles.active : ''
                  }`}
                  onClick={handleTabClick('테마')}
                >
                  테마
                </button>
              </div>
              <div className={styles.categoryItems}>
                {currentKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className={`${styles.categoryItem} ${
                      activeRegion === keyword ? styles.activeItem : ''
                    }`}
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
    </div>
  );
};

export default PostList;
