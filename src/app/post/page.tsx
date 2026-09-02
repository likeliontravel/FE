'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { 
  fetchBoards, 
  searchBoards, 
  fetchBoardsByRegion,
  fetchBoardsByTheme,
  Board 
} from '../../../util/board/boardSilce'; // 파일명 오타 유지 (boardSilce)
import styles from '../../../styles/post/postList.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import Image from 'next/image';

const regionKeywords = [
  '가평/양평',
  '강릉',
  '경주',
  '강남',
  '부산',
  '여수',
  '인천',
  '중구/강북',
  '전주',
  '제주',
  '춘천/홍천',
  '태안',
  '통영/거제',
  '포항/안동',
];

const themeKeywords = [
  '체험 및 액티비티',
  '자연 속에서 힐링',
  '열정적인 쇼핑투어',
  '미식 여행/먹방 중심',
  '문화 예술 및 역사 탐방',
];

const getProfileImage = (url: string | null | undefined): string => {
  if (!url || url === 'null' || url.trim() === '') {
    return '/imgs/default-profile.png';
  }
  if (url.includes('default-profile') || url.includes('default_profile')) {
    return '/imgs/default-profile.png';
  }
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return '/imgs/default-profile.png';
  }
  return url;
};

const createExcerpt = (htmlContent: string, maxLength: number = 100): string => {
  if (!htmlContent) return '';
  try {
    const decodedHtml = htmlContent
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'");

    const plainText = decodedHtml.replace(/<[^>]*>/g, '');

    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
  } catch (e) {
    return '';
  }
};

const PostList = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth || {});
  const { posts, loading, error } = useSelector((state: RootState) => state.board || {});

  const [currentQuery, setCurrentQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'POPULAR' | 'RECENT'>('RECENT');
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = () => {
      if (currentQuery) {
        dispatch(searchBoards({ searchKeyword: currentQuery, sortType: sortOrder }));
      } else if (activeCategory) {
        if (activeTab === '지역') {
          dispatch(fetchBoardsByRegion({ region: activeCategory, sortType: sortOrder }));
        } else {
          dispatch(fetchBoardsByTheme({ theme: activeCategory, sortType: sortOrder }));
        }
      } else {
        dispatch(fetchBoards({ page: 0, size: 30, sortType: sortOrder }));
      }
    };
    loadPosts();
  }, [dispatch, sortOrder, currentQuery, activeCategory, activeTab]);

  const sortedPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) return [];
    return [...posts].sort((a, b) => {
      if (sortOrder === 'RECENT') {
        return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      } else {
        return (b.boardHits || 0) - (a.boardHits || 0);
      }
    });
  }, [posts, sortOrder]);

  const handleSearch = (term: string) => {
    setCurrentQuery(term);
    setActiveCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setCurrentQuery('');
    setActiveCategory(prevCategory => prevCategory === category ? null : category);
  };

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'POPULAR' | 'RECENT');
  }, []);
  
  const handleTabClick = useCallback((tab: '지역' | '테마') => () => {
    if (activeTab !== tab) {
        setActiveTab(tab);
        setActiveCategory(null);
    }
  }, [activeTab]);

  const requireLogin = useCallback(() => {
    if (!loggedInUser) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return false;
    }
    return true;
  }, [loggedInUser, router]);

  const goToPostWrite = useCallback(() => {
    if (!requireLogin()) return;
    router.push('/postWrite');
  }, [router, requireLogin]);

  const goToMyPosts = useCallback(() => {
    if (!requireLogin()) return;
    router.push('/posts/mypost');
  }, [router, requireLogin]);

  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
         </section>

        <div className={styles.mainWrapper}>
          <main className={styles.mainContent}>
            <div className={styles.sortOptions}>
              <select value={sortOrder} onChange={handleSortChange} className={styles.sortSelect}>
                <option value="RECENT">최신순</option>
                <option value="POPULAR">인기순</option>
              </select>
            </div>
            <div className={styles.postList}>
              {loading && <p>게시글을 불러오는 중...</p>}
              {error && <p>에러: {error}</p>}
              
              {!loading && !error && sortedPosts.map((post: Board) => (
                <Link href={`/posts/${post.id}`} key={post.id} className={styles.postItemLink}>
                  <div className={styles.postItem}>
                    <div className={styles.postTextContent}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 className={styles.postTitle} style={{ margin: 0, lineHeight: '1.2' }}>{post.title}</h3>
                        {post.region && (
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#eef2f3', color: '#555', whiteSpace: 'nowrap' }}>
                            {post.region}
                          </span>
                        )}
                        {post.theme && (
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#eef3fe', color: '#3a7bd5', whiteSpace: 'nowrap' }}>
                            {post.theme}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.postMeta}>
                          <div 
                            className={styles.authorAvatar} 
                            style={{ backgroundImage: `url(${getProfileImage(post.writerProfileImageUrl)})` }}
                          ></div>
                          <span className={styles.authorName}>{post.writer}</span>
                          <span className={styles.viewCount}>조회수 {post.boardHits}</span>
                      </div>
                      <p className={styles.postExcerpt}>
                        {createExcerpt(post.content)}
                      </p>
                    </div>
                    {post.thumbnailPublicUrl && (
                      <img src={post.thumbnailPublicUrl} alt={post.title} className={styles.postImage} />
                    )}
                  </div>
                </Link>
              ))}
               {!loading && sortedPosts.length === 0 && <p>표시할 게시글이 없습니다.</p>}
            </div>
          </main>

          <aside className={styles.sidebar}>
            {/* 프로필 카드 영역 */}
            <div className={styles.profileCard}>
              {loggedInUser && loggedInUser.name ? (
                <>
                  <div className={styles.profileHeader}>
                    <img 
                      src={getProfileImage(loggedInUser.profileImageUrl)} 
                      alt={`${loggedInUser.name}님의 프로필`}
                      width={50} 
                      height={50} 
                      className={styles.profileImage}
                    />
                    <p className={styles.username}>{loggedInUser.name}님</p>
                  </div>
                  <div className={styles.profileDivider} />
                  
                  {/* 💡 [수정] 2열 버튼으로 재배치된 프로필 액션 (글쓰기 & 내 글 보기) */}
                  <div className={styles.profileActions}>
                    <button type="button" className={styles.writeButton} onClick={goToPostWrite}>
                      <Image src="/imgs/writing.png" alt="글쓰기" width={22} height={22} />
                      <span>글쓰기</span>
                    </button>
                    <button type="button" className={styles.myPostsButton} onClick={goToMyPosts}>
                      <Image src="/imgs/myposts.png" alt="내 글 보기" width={22} height={22} />
                      <span>내 글 보기</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.loginContainer}>
                  <p className={styles.loginPrompt}>로그인하고 더 많은 기능을 이용해보세요!</p>
                  <button type="button" className={styles.loginButton} onClick={() => router.push('/login')}>
                    로그인 / 회원가입
                  </button>
                </div>
              )}
            </div>

            {/* 지역 및 테마 필터 영역 */}
            <div className={styles.categoryContainer}>
              <div className={styles.categoryTabs}>
                <button 
                  type="button"
                  className={`${styles.categoryTab} ${activeTab === '지역' ? styles.active : ''}`} 
                  onClick={handleTabClick('지역')}
                >
                  📍 지역별
                </button>
                <button 
                  type="button"
                  className={`${styles.categoryTab} ${activeTab === '테마' ? styles.active : ''}`} 
                  onClick={handleTabClick('테마')}
                >
                  🏷️ 테마별
                </button>
              </div>

              <div className={`${styles.categoryItems} ${activeTab === '테마' ? styles.themeGrid : ''}`}>
                {currentKeywords.map((keyword) => {
                  const isSelected = activeCategory === keyword;
                  return (
                    <button 
                      key={keyword} 
                      type="button"
                      className={`${styles.categoryItem} ${isSelected ? styles.activeItem : ''}`} 
                      onClick={() => handleCategoryClick(keyword)}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostList;