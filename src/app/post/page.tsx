'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from '../../../util/board/boardSilce';
import styles from '../../../styles/post/postList.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import Image from 'next/image';

const regionKeywords = [
  '서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'
];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

const PostList = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.board);

  const [currentQuery, setCurrentQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'POPULAR' | 'RECENT'>('POPULAR');
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
        dispatch(fetchBoards({ sortType: sortOrder }));
      }
    };
    loadPosts();
  }, [dispatch, sortOrder, currentQuery, activeCategory, activeTab]);

  const handleSearch = (term: string) => {
    setCurrentQuery(term);
    setActiveCategory(null); // 검색 시 카테고리 선택 해제
  };

  const handleCategoryClick = (category: string) => {
    setCurrentQuery(''); // 카테고리 클릭 시 검색어 초기화
    setActiveCategory(category);
  };

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'POPULAR' | 'RECENT');
  }, []);
  
  const handleTabClick = useCallback((tab: '지역' | '테마') => () => {
    setActiveTab(tab);
    setActiveCategory(null);
  }, []);

  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
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
                <option value="POPULAR">인기순</option>
                <option value="RECENT">최신순</option>
              </select>
            </div>
            <div className={styles.postList}>
              {loading && <p>게시글을 불러오는 중...</p>}
              {error && <p>에러: {error}</p>}
              {!loading && !error && posts.map((post: Board) => (
                <Link href={`/posts/${post.id}`} key={post.id} className={styles.postItemLink}>
                  <div className={styles.postItem}>
                    <div className={styles.postTextContent}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <div className={styles.postMeta}>
                          <div className={styles.authorAvatar}></div>
                          <span className={styles.authorName}>{post.writer}</span>
                      </div>
                      <p className={styles.postExcerpt} dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                    <img src={post.thumbnailPublicUrl || '/imgs/default-thumbnail.png'} alt={post.title} className={styles.postImage} />
                  </div>
                </Link>
              ))}
               {!loading && posts.length === 0 && <p>표시할 게시글이 없습니다.</p>}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <Image src="/imgs/Ellipse5.png" alt="profile" width={50} height={50} className={styles.profileImage}/>
                <p className={styles.username}>린님</p>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button><Image src="/imgs/Popular.png" alt="인기글" width={36} height={36} /><span>인기글 보기</span></button>
                <button onClick={goToPostWrite}><Image src="/imgs/writing.png" alt="글쓰기" width={36} height={36} /><span>글쓰기</span></button>
                <button><Image src="/imgs/myposts.png" alt="내 글" width={36} height={36} /><span>내 글보기</span></button>
              </div>
            </div>
            <div className={styles.categoryContainer}>
              <div className={styles.categoryTabs}>
                <button className={`${styles.categoryTab} ${activeTab === '지역' ? styles.active : ''}`} onClick={handleTabClick('지역')}>지역</button>
                <button className={`${styles.categoryTab} ${activeTab === '테마' ? styles.active : ''}`} onClick={handleTabClick('테마')}>테마</button>
              </div>
              <div className={styles.categoryItems}>
                {currentKeywords.map((keyword) => (
                  <span key={keyword} className={`${styles.categoryItem} ${activeCategory === keyword ? styles.activeItem : ''}`} onClick={() => handleCategoryClick(keyword)}>
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