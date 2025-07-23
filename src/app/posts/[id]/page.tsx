'use client';

import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store'; // 실제 경로로 수정
import { fetchBoardDetail, fetchComments, createComment } from '../../../../util/board/boardSilce'; // 실제 경로로 수정
import styles from '../../../../styles/postDetail/postDetail.module.scss';
import SearchBar from '../../SearchBar/SearchBar'; // 실제 경로로 수정
import Image from 'next/image';

const regionKeywords = ['서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

const PostDetail = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { post, comments, loading, error } = useSelector((state: RootState) => state.board);
  
  // URL의 id가 문자열 배열일 수 있으므로, 첫 번째 값만 사용하고 숫자로 변환
  const id = params.id ? parseInt(Array.isArray(params.id) ? params.id[0] : params.id, 10) : 0;
  
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [comment, setComment] = useState('');

  useEffect(() => {
    // id가 유효한 숫자인지 확인 후 데이터 요청
    if (id && !isNaN(id)) {
      dispatch(fetchBoardDetail(id));
      dispatch(fetchComments(id));
    }
  }, [dispatch, id]);

  const handleCommentSubmit = useCallback(async () => {
    if (!comment.trim() || !id) return;
    try {
      await dispatch(createComment({ boardId: id, commentContent: comment })).unwrap();
      setComment(''); // 입력창 비우기
      dispatch(fetchComments(id)); // 댓글 목록 새로고침
    } catch (err) {
      alert(`댓글 작성 실패: ${err}`);
      console.error('댓글 작성 실패:', err);
    }
  }, [dispatch, id, comment]);
  
  const handleTabClick = useCallback((tab: '지역' | '테마') => () => setActiveTab(tab), []);
  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }, []);

  const postBodyContent = useMemo(() => {
    if (!post?.content) return { __html: '' };
    // 백엔드에서 이미 HTML로 제공하므로, 줄바꿈 처리는 필요 없을 수 있습니다.
    // 만약 일반 텍스트로 온다면 .replace(/\n/g, '<br />')를 사용합니다.
    return { __html: post.content };
  }, [post?.content]);

  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  if (loading && !post) return <div style={{ padding: '50px', textAlign: 'center' }}>게시글을 불러오는 중...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center' }}>에러가 발생했습니다: {error}</div>;
  if (!post) return <div style={{ padding: '50px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          {/* ✅ onSearch prop이 필수가 아닌 SearchBar를 사용합니다. */}
          <SearchBar onSearch={() => {}}/>
        </section>

        <div className={styles.contentWrapper}>
          <main className={styles.mainContent}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar} style={{ backgroundImage: `url(${post.writerProfileImageUrl || '/imgs/default-profile.png'})` }}></div>
              <span className={styles.authorName}>{post.writer}</span>
            </div>
            <div className={styles.imageGrid}>
              {/* API 응답에 이미지가 하나이므로 일단 하나만 표시, 추후 확장 가능 */}
              <img src={post.thumbnailPublicUrl || '/imgs/default-thumbnail.png'} alt={post.title} />
            </div>
            <p className={styles.postBody} dangerouslySetInnerHTML={postBodyContent} />
            
            <div className={styles.commentsSection}>
              <div className={styles.commentInputWrapper}>
                <div className={styles.commentInputContainer}>
                  <textarea placeholder="따뜻한 댓글을 남겨주세요 :)" value={comment} onChange={handleCommentChange} maxLength={200} />
                  <span className={styles.charCount}>{comment.length}/200</span>
                </div>
                <button className={styles.sendButton} onClick={handleCommentSubmit} disabled={loading}>
                  {loading ? '...' : <Image src="/imgs/comment_send.png" alt="댓글 전송" width={48} height={48} />}
                </button>
              </div>
              <div className={styles.commentList}>
                {comments && comments.length > 0 ? comments.map(c => (
                  <Fragment key={c.id}>
                    <div className={styles.commentItem}>
                      <img src={c.commentWriterProfileImageUrl || '/imgs/default-profile.png'} alt={c.commentWriter} className={styles.commentAvatar} />
                      <div className={styles.commentBody}>
                        <span className={styles.commentAuthor}>{c.commentWriter}</span>
                        <p className={styles.commentText}>{c.commentContent}</p>
                        <div className={styles.commentMeta}>
                           <button>
                                <Image src="/imgs/message-square.png" alt="댓글 수" width={16} height={16} />
                                <span>0</span> {/* 대댓글 기능은 추후 구현 */}
                           </button>
                        </div>
                      </div>
                    </div>
                    {/* 대댓글 렌더링 로직 (parentCommentId를 기준으로 그룹핑 필요) */}
                  </Fragment>
                )) : <p>아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>}
              </div>
            </div>
          </main>
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <Image src="/images/profile.png" alt="profile" width={50} height={50} className={styles.profileImage} />
                <p className={styles.username}>린님</p>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button><img src="/imgs/Popular.png" alt="인기글" /><span>인기글 보기</span></button>
                <button onClick={goToPostWrite}><img src="/imgs/writing.png" alt="글쓰기" /><span>글쓰기</span></button>
                <button><img src="/imgs/myposts.png" alt="내 글" /><span>내 글보기</span></button>
              </div>
            </div>
            <div className={styles.categoryContainer}>
              <div className={styles.categoryTabs}>
                <button className={`${styles.categoryTab} ${activeTab === '지역' ? styles.active : ''}`} onClick={handleTabClick('지역')}>지역</button>
                <button className={`${styles.categoryTab} ${activeTab === '테마' ? styles.active : ''}`} onClick={handleTabClick('테마')}>테마</button>
              </div>
              <div className={styles.categoryItems}>
                {currentKeywords.map((keyword) => (
                  <span key={keyword} className={styles.categoryItem}>{keyword}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;