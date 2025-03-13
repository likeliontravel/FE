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

  const recommendedKeywords = [
    '여수 맛집',
    '여행 코스',
    '가족 여행',
    '숙소 추천',
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching posts:', error); // 콘솔 출력 추가
        }
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
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className={styles.recommendedKeywords}>
        {recommendedKeywords.map((keyword) => (
          <span
            key={keyword}
            className={styles.keyword}
            onClick={handleKeywordClick(keyword)}
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className={styles.sortOptions}>
        <label htmlFor="sortSelect">정렬:</label>
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

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
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
                src="/images/empty.png"
                alt="게시글 없음"
                className={styles.emptyImage}
              />
              <p>앗! 아직 게시글이 없어요</p>
              <p>즐거운 여행의 추억을 공유해주세요 ✈️</p>
            </div>
          )}
        </div>

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
                <span key={region} className={styles.categoryItem}>
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
