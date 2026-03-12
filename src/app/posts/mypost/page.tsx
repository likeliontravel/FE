'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const createExcerpt = (htmlContent: string, maxLength: number = 100): string => {
  if (typeof window === 'undefined' || !htmlContent) return '';
  try {
    const parser = new DOMParser();
    const unescapedHtml = parser.parseFromString(`<!doctype html><body>${htmlContent}`, 'text/html').body.textContent || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = unescapedHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  } catch (e) {
    return '';
  }
};

const MyPostsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: loggedInUser, loading: authLoading } = useSelector((state: RootState) => state.auth || {});
  const { posts, loading, error } = useSelector((state: RootState) => state.board || {});

  useEffect(() => {
    if (authLoading) return;

    if (!loggedInUser) {
      alert('로그인이 필요한 페이지입니다.');
      router.replace('/login');
      return;
    }

    if (loggedInUser.userIdentifier) {
      dispatch(fetchMyBoards(loggedInUser.userIdentifier));
    }
  }, [dispatch, loggedInUser, authLoading, router]);

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
              {!loading && !error && posts && posts.map((post: Board) => (
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
               {!loading && posts?.length === 0 && <p>작성한 게시글이 없습니다.</p>}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
                <>
                  <div className={styles.profileHeader}>
                    <Image 
                      src={loggedInUser.profileImageUrl || "/imgs/default-profile.png"} 
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