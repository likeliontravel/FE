'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { 
  fetchMyBoards,
  Board 
} from '../../../../util/board/boardSilce'; // 파일명 오타 유지 (boardSilce)
import styles from '../../../../styles/post/postList.module.scss';
import SearchBar from '../../SearchBar/SearchBar';
import Image from 'next/image';

// --- 프로필 이미지 예외 처리 전용 헬퍼 함수 ---
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

// --- 안전한 엔티티 디코딩 및 태그 제거 함수 (수화 오류 및 태그 노출 방지) ---
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

const MyPostsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: loggedInUser, loading: authLoading } = useSelector((state: RootState) => state.auth || {});
  const { posts, loading, error } = useSelector((state: RootState) => state.board || {});

  // 🔥 수정: userIdentifier가 유실되었을 경우를 대비해 email이나 name을 식별자로 대체 사용하여 API 호출 보장
  useEffect(() => {
    if (authLoading) return;

    if (!loggedInUser) {
      alert('로그인이 필요한 페이지입니다.');
      router.replace('/login');
      return;
    }

    const myId = loggedInUser.userIdentifier || loggedInUser.email || loggedInUser.name;
    if (myId) {
      dispatch(fetchMyBoards(myId));
    }
  }, [dispatch, loggedInUser, authLoading, router]);

  // 🔥 2차 방어 필터링: 식별자가 없거나 누락되어 undefined === undefined로 필터가 풀리는 현상을 완벽 차단
  const myFilteredPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts) || !loggedInUser) return [];
    
    const myIdentifier = loggedInUser.userIdentifier || loggedInUser.email;
    const myName = loggedInUser.name;

    return posts.filter(post => {
      // 1단계: 작성자 고유 식별자(이메일 또는 ID)가 존재하면 먼저 대조
      if (post.writerIdentifier && myIdentifier) {
        return post.writerIdentifier === myIdentifier;
      }
      // 2단계: 목록 조회 시 식별자가 누락되어 들어올 경우 이름(writer)으로 최종 가드 적용
      if (post.writer && myName) {
        return post.writer === myName;
      }
      return false; // 본인 확인이 불가능한 글은 모두 제외
    });
  }, [posts, loggedInUser]);

  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
  const goToMyPosts = useCallback(() => router.push('/posts/mypost'), [router]);

  if (authLoading || !loggedInUser) {
    return <div style={{textAlign: 'center', padding: '50px'}}>사용자 정보를 확인 중입니다...</div>;
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
              {!loading && !error && myFilteredPosts.map((post: Board) => (
                <Link href={`/posts/${post.id}`} key={post.id} className={styles.postItemLink}>
                  <div className={styles.postItem}>
                    <div className={styles.postTextContent}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <div className={styles.postMeta}>
                          {/* 내 글 목록 내 작성자 프로필 이미지 예외 처리 */}
                          <div 
                            className={styles.authorAvatar} 
                            style={{ backgroundImage: `url(${getProfileImage(post.writerProfileImageUrl)})` }}
                          ></div>
                          <span className={styles.authorName}>{post.writer}</span>
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
               {!loading && myFilteredPosts.length === 0 && <p>작성한 게시글이 없습니다.</p>}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
                <>
                  <div className={styles.profileHeader}>
                    {/* 내 글 보기 사이드바 본인 프로필 이미지 예외 처리 */}
                    <Image 
                      src={getProfileImage(loggedInUser.profileImageUrl)} 
                      alt={`${loggedInUser.name}님의 프로필`}
                      width={50} 
                      height={50} 
                      className={styles.profileImage}
                    />
                    <p className={styles.username}>{loggedInUser.name}님</p>
                  </div>
                  <div className={styles.profileDivider} />
                  <div className={styles.profileActions}>
                    <button><Image src="/imgs/Popular.png" alt="인기글" width={36} height={36} /><span>인기글 보기</span></button>
                    <button onClick={goToPostWrite}><Image src="/imgs/writing.png" alt="글쓰기" width={36} height={36} /><span>글쓰기</span></button>
                    <button onClick={goToMyPosts}><Image src="/imgs/myposts.png" alt="내 글" width={36} height={36} /><span>내 글보기</span></button>
                  </div>
                </>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;