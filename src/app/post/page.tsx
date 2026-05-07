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
  '서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'
];

// 백엔드 명세 및 WritePage와 일치시킨 테마 키워드
const themeKeywords = [
  '자연 속에서 힐링', 
  '미식 여행 및 먹방 중심', 
  '체험 및 액티비티', 
  '문화예술 및 역사탐방', 
  '기타'
];

const createExcerpt = (htmlContent: string, maxLength: number = 100): string => {
  if (typeof window === 'undefined' || !htmlContent) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
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
      // 모든 목록 조회 로직을 통합된 API 규격에 맞춰 호출
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
    // 기본적으로 백엔드에서 정렬되어 오지만, 클라이언트 사이드에서 한번 더 안전하게 정렬
    const list = [...posts];
    return list.sort((a, b) => {
      if (sortOrder === 'RECENT') {
        return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      }
      return (b.boardHits || 0) - (a.boardHits || 0);
    });
  }, [posts, sortOrder]);

  const handleSearch = (term: string) => {
    setCurrentQuery(term);
    setActiveCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setCurrentQuery('');
    // 이미 선택된 카테고리를 다시 누르면 해제, 아니면 새로 선택
    setActiveCategory(prev => prev === category ? null : category);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'POPULAR' | 'RECENT');
  };
  
  const handleTabClick = (tab: '지역' | '테마') => () => {
    setActiveTab(tab);
    setActiveCategory(null); // 탭 전환 시 필터 초기화
  };

  const goToPostWrite = () => {
    if (!loggedInUser) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
      return;
    }
    router.push('/postWrite');
  };

  const goToMyPosts = () => {
    if (!loggedInUser) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
      return;
    }
    router.push('/posts/mypost');
  };

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
              <div className={styles.tabButtons}>
                <button 
                  className={`${styles.tabButton} ${activeTab === '지역' ? styles.active : ''}`}
                  onClick={handleTabClick('지역')}
                >
                  지역별
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === '테마' ? styles.active : ''}`}
                  onClick={handleTabClick('테마')}
                >
                  테마별
                </button>
              </div>
              <select value={sortOrder} onChange={handleSortChange} className={styles.sortSelect}>
                <option value="RECENT">최신순</option>
                <option value="POPULAR">인기순</option>
              </select>
            </div>

            <div className={styles.postList}>
              {loading && <p className={styles.infoText}>게시글을 불러오는 중입니다...</p>}
              {error && <p className={styles.errorText}>에러가 발생했습니다: {error}</p>}
              
              {!loading && sortedPosts.length === 0 && (
                <p className={styles.infoText}>표시할 게시글이 없습니다.</p>
              )}

              {!loading && sortedPosts.map((post: Board) => (
                <Link href={`/posts/${post.id}`} key={post.id} className={styles.postItemLink}>
                  <div className={styles.postItem}>
                    <div className={styles.postTextContent}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <div className={styles.postMeta}>
                          <div 
                            className={styles.authorAvatar} 
                            style={{ backgroundImage: `url(${post.writerProfileImageUrl || '/imgs/default-profile.png'})` }}
                          ></div>
                          <span className={styles.authorName}>{post.writer}</span>
                          <span className={styles.metaDivider}>|</span>
                          <span className={styles.viewCount}>조회수 {post.boardHits}</span>
                          <span className={styles.metaDivider}>|</span>
                          <span className={styles.postDate}>{post.createdTime.split('T')[0]}</span>
                      </div>
                      <p className={styles.postExcerpt}>
                        {createExcerpt(post.content)}
                      </p>
                    </div>
                    {post.thumbnailPublicUrl && (
                      <div className={styles.postImageWrapper}>
                        <img src={post.thumbnailPublicUrl} alt={post.title} className={styles.postImage} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              {loggedInUser ? (
                <div className={styles.userProfile}>
                  <div className={styles.profileInfo}>
                    <Image 
                      src={loggedInUser.profileImageUrl || "/imgs/default-profile.png"} 
                      alt="프로필" 
                      width={40} 
                      height={40} 
                      className={styles.avatar}
                    />
                    <span className={styles.userName}>{loggedInUser.name}님 환영합니다</span>
                  </div>
                  <div className={styles.sideButtons}>
                    <button onClick={goToPostWrite} className={styles.sideButton}>글쓰기</button>
                    <button onClick={goToMyPosts} className={styles.sideButton}>내 글보기</button>
                  </div>
                </div>
              ) : (
                <div className={styles.loginPrompt}>
                  <p>더 많은 기능을 이용하려면</p>
                  <button onClick={() => router.push('/login')} className={styles.loginButton}>로그인하기</button>
                </div>
              )}
            </div>

            <div className={styles.categoryContainer}>
              <h4 className={styles.categoryTitle}>{activeTab} 필터</h4>
              <div className={styles.categoryItems}>
                {currentKeywords.map((keyword) => (
                  <span 
                    key={keyword} 
                    className={`${styles.categoryItem} ${activeCategory === keyword ? styles.activeItem : ''}`} 
                    onClick={() => handleCategoryClick(keyword)}
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