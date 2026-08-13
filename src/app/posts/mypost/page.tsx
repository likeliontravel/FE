'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { 
  fetchMyBoards,
  Board 
} from '../../../../util/board/boardSilce'; 
import styles from '../../../../styles/post/postList.module.scss';
import SearchBar from '../../SearchBar/SearchBar';
import Image from 'next/image';

const getProfileImage = (url: string | null | undefined): string => {
  if (!url || url === 'null' || typeof url !== 'string' || url.trim() === '') {
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

// --- 안전한 엔티티 디코딩 및 태그 제거 함수 ---
const createExcerpt = (htmlContent: string | null | undefined, maxLength: number = 100): string => {
  if (!htmlContent || typeof htmlContent !== 'string') return '';
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

const MyPostsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  const { user: loggedInUser, loading: authLoading } = useSelector((state: RootState) => state.auth || {});
  const { posts, loading, error } = useSelector((state: RootState) => state.board || {});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;

    if (loggedInUser) {
      dispatch(fetchMyBoards({
        userIdentifier: loggedInUser?.userIdentifier,
        email: loggedInUser?.email,
        name: loggedInUser?.name,
        id: loggedInUser?.id
      }));
    }
  }, [dispatch, loggedInUser, authLoading, isMounted]);

  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
  const goToMyPosts = useCallback(() => router.push('/posts/mypost'), [router]);

  if (!isMounted || authLoading) {
    return <div style={{textAlign: 'center', padding: '50px'}}>사용자 정보를 확인 중입니다...</div>;
  }

  // 로그인되어 있지 않을 때 안전한 안내 UI 출력
  if (!loggedInUser) {
    return (
      <div style={{textAlign: 'center', padding: '50px'}}>
        <p>로그인이 필요한 페이지입니다.</p>
        <button 
          onClick={() => router.push('/login')}
          style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#27abf1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
            <SearchBar onSearch={() => {}} />
         </section>

        <div className={styles.mainWrapper}>
          <main className={styles.mainContent}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>내 작성글</h2>
            <div className={styles.postList}>
              {loading && <p>게시글을 불러오는 중...</p>}
              {error && <p>에러: {error}</p>}
              
              {!loading && !error && Array.isArray(posts) && posts.map((post: Board) => {
                if (!post) return null;
                return (
                  <Link href={`/posts/${post.id}`} key={post.id} className={styles.postItemLink}>
                    <div className={styles.postItem}>
                      <div className={styles.postTextContent}>
                        <h3 className={styles.postTitle}>{post.title || '제목 없음'}</h3>
                        <div className={styles.postMeta}>
                            <div 
                              className={styles.authorAvatar} 
                              style={{ backgroundImage: `url(${getProfileImage(post.writerProfileImageUrl)})` }}
                            ></div>
                            <span className={styles.authorName}>{post.writer || '익명'}</span>
                        </div>
                        <p className={styles.postExcerpt}>
                          {createExcerpt(post.content)}
                        </p>
                      </div>
                      {post.thumbnailPublicUrl && (
                        <img src={post.thumbnailPublicUrl} alt={post.title || '게시글 이미지'} className={styles.postImage} />
                      )}
                    </div>
                  </Link>
                );
              })}
              {!loading && (!posts || !Array.isArray(posts) || posts.length === 0) && <p>작성한 게시글이 없습니다.</p>}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <img 
                  src={getProfileImage(loggedInUser?.profileImageUrl)} 
                  alt={`${loggedInUser?.name || ''}님의 프로필`}
                  width={50} 
                  height={50} 
                  className={styles.profileImage}
                />
                <p className={styles.username}>{loggedInUser?.name || ''}님</p>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button type="button"><Image src="/imgs/Popular.png" alt="인기글" width={36} height={36} /><span>인기글 보기</span></button>
                <button type="button" onClick={goToPostWrite}><Image src="/imgs/writing.png" alt="글쓰기" width={36} height={36} /><span>글쓰기</span></button>
                <button type="button" onClick={goToMyPosts}><Image src="/imgs/myposts.png" alt="내 글" width={36} height={36} /><span>내 글보기</span></button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;