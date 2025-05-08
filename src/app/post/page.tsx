'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/post/postList.module.scss';
import SearchBar from '../SearchBar/SearchBar';

interface PostType {
  id: number;
  title: string;
  writer: string;
  content: string;
  image: string;
}

const PostList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('popular');
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 실제 API 호출
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch {
        const testPosts: PostType[] = [
          {
            id: 1,
            title: '서울 여행',
            writer: '린님',
            content:
              '서울에서의 즐거운 여행이었습니다. 정말 멋진 경험이었어요!',
            image: '/imgs/sample1.jpg',
          },
          {
            id: 2,
            title: '부산 바다',
            writer: '홍길동',
            content:
              '부산의 바다는 정말 아름답습니다. 기회가 된다면 꼭 다시 가고 싶어요!',
            image: '/imgs/sample2.jpg',
          },
          {
            id: 3,
            title: '제주도에서의 하루',
            writer: '김철수',
            content:
              '제주도에서 하루를 보내며 즐거운 시간을 보냈습니다. 자연이 정말 멋져요!',
            image: '/imgs/sample3.jpg',
          },
        ];
        setPosts(testPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleKeywordClick = useCallback(
    (keyword: string) => () => {
      setSearchTerm(keyword);
    },
    []
  );

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

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className={styles.contentWrapper}>
        {/* 메인 컨텐츠 */}
        <div className={styles.mainContent}>
          <div className={styles.sortOptionsInside}>
            <select
              id="sortSelect"
              value={sortOrder}
              onChange={handleSortChange}
              className={styles.sortSelect}
            >
              <option value="popular">인기순</option>
              <option value="recent">최신순</option>
            </select>
          </div>

          {loading ? (
            <p>게시글을 불러오는 중...</p>
          ) : filteredPosts.length > 0 ? (
            <div className={styles.postList}>
              {filteredPosts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className={styles.postImage}
                  />
                  <div className={styles.postContent}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postMeta}>{post.writer}</p>
                    <p className={styles.postExcerpt}>
                      {post.content.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <img
                src="/imgs/NoPost.png"
                alt="게시글 없음"
                className={styles.emptyImage}
              />
              <div className={styles.emptyTitle}>앗! 아직 게시글이 없어요</div>
              <div className={styles.emptySubtitle}>
                즐거운 여행의 추억을 공유해주세요 ✈️
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className={styles.sidebar}>
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

          {/* 카테고리 */}
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

            <div className={styles.categoryItems}>
              {['서울', '부산', '제주', '여수'].map((region) => (
                <span
                  key={region}
                  className={styles.categoryItem}
                  onClick={handleKeywordClick(region)}
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostList;
