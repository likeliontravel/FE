'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { 
  fetchBoardDetail, 
  fetchComments, 
  createComment, 
  deleteBoard, 
  deleteComment, 
  updateComment, 
  Comment,
  clearBoardLoading
} from '../../../../util/board/boardSilce'; // 파일명 오타 유지 (boardSilce)
import styles from '../../../../styles/postDetail/postDetail.module.scss';
import SearchBar from '../../SearchBar/SearchBar';
import Image from 'next/image';

const regionKeywords = [
  '서울', '인천', '대전', '대구', '광주', '부산', '울산', '경기', '강원', 
  '충북', '충남', '세종', '전북', '전남', '경북', '경남', '제주', '가평', 
  '양양', '강릉', '경주', '전주', '여수', '춘천', '홍천', '태안', '통영', 
  '거제', '포항', '안동'
];

const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

interface NestedComment extends Comment {
  children: NestedComment[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
};

const unescapeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent || "";
};

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

// --- 개별 댓글 아이템 컴포넌트 ---
const CommentItem = ({ 
  comment, 
  isReply, 
  replyingTo, 
  onReplyClick, 
  onReplySubmit, 
  replyContent, 
  onReplyContentChange,
  loading, 
  loggedInUser, 
  editingCommentId, 
  editingContent, 
  onEditingContentChange,
  onStartEdit, 
  onCancelEdit, 
  onUpdateComment, 
  onDeleteComment
}: { 
  comment: NestedComment; 
  isReply: boolean; 
  replyingTo: number | null; 
  onReplyClick: (id: number) => void;
  onReplySubmit: (id: number) => void; 
  replyContent: string; 
  onReplyContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loading: boolean; 
  loggedInUser: any; 
  editingCommentId: number | null; 
  editingContent: string;
  onEditingContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onStartEdit: (comment: Comment) => void; 
  onCancelEdit: () => void; 
  onUpdateComment: () => void; 
  onDeleteComment: (id: number) => void;
}) => {
  const isEditing = editingCommentId === comment.id;
  const isAuthor = loggedInUser && loggedInUser.userIdentifier === comment.commentWriterIdentifier;

  return (
    <div className={isReply ? styles.replyItem : styles.commentItem}>
      {isReply && (
        <div className={styles.replyArrow}>
          <Image src="/imgs/reply.png" alt="대댓글" width={20} height={20} />
        </div>
      )}
      
      <img 
        src={getProfileImage(comment.commentWriterProfileImageUrl)} 
        alt="프사" 
        className={styles.commentAvatar} 
      />
      
      <div className={styles.commentBody}>
        <span className={styles.commentAuthor}>
          {comment.commentWriter || comment.writer}
        </span>
        
        {isEditing ? (
          <div className={styles.editCommentForm}>
            <textarea 
              value={editingContent} 
              onChange={onEditingContentChange} 
              maxLength={200} 
              autoFocus 
            />
            <div className={styles.editActions}>
              <button onClick={onCancelEdit}>취소</button>
              <button onClick={onUpdateComment} disabled={loading}>저장</button>
            </div>
          </div>
        ) : (
          <p className={styles.commentText}>{comment.commentContent}</p> 
        )}

        <div className={styles.commentMeta}>
          <span className={styles.commentDate}>
            {formatDate(comment.commentCreatedTime)}
          </span>
          {!isReply && (
            <button onClick={() => onReplyClick(comment.id)}>
              <Image src="/imgs/message-square.png" alt="답글" width={16} height={16} />
              <span>답글</span>
            </button>
          )}
          {isAuthor && !isEditing && (
            <div className={styles.commentActions}>
              <button onClick={() => onStartEdit(comment)}>수정</button>
              <button onClick={() => onDeleteComment(comment.id)}>삭제</button>
            </div>
          )}
        </div>
        
        {replyingTo === comment.id && (
          <div className={styles.commentInputWrapper} style={{ marginTop: '15px' }}>
            <div className={styles.commentInputContainer}>
              <textarea 
                placeholder={`@${comment.commentWriter || comment.writer}님에게 답글 남기기`} 
                value={replyContent} 
                onChange={onReplyContentChange} 
                maxLength={200} 
                autoFocus 
              />
              <span className={styles.charCount}>{replyContent.length}/200</span>
            </div>
            <button 
              className={styles.sendButton} 
              onClick={() => onReplySubmit(comment.id)} 
              disabled={loading}
            >
              <Image src="/imgs/comment_send.png" alt="전송" width={48} height={48} />
            </button>
          </div>
        )}

        {comment.children.length > 0 && (
          <div className={styles.repliesContainer}>
            {comment.children.map(child => (
              <CommentItem 
                key={child.id} 
                comment={child} 
                isReply={true} 
                replyingTo={replyingTo} 
                onReplyClick={onReplyClick} 
                onReplySubmit={onReplySubmit} 
                replyContent={replyContent} 
                onReplyContentChange={onReplyContentChange} 
                loading={loading} 
                loggedInUser={loggedInUser} 
                editingCommentId={editingCommentId} 
                editingContent={editingContent} 
                onEditingContentChange={onEditingContentChange} 
                onStartEdit={onStartEdit} 
                onCancelEdit={onCancelEdit} 
                onUpdateComment={onUpdateComment} 
                onDeleteComment={onDeleteComment} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 메인 PostDetail ---
const PostDetail = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth || {});
  const { post, comments, loading, error } = useSelector((state: RootState) => state.board || {});
  
  const boardId = useMemo(() => {
    return params.id ? parseInt(Array.isArray(params.id) ? params.id[0] : params.id, 10) : 0;
  }, [params.id]);
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const requireLogin = useCallback(() => { 
    if (!loggedInUser) { 
      alert('로그인이 필요한 기능입니다.'); 
      router.push('/login'); 
      return false; 
    } 
    return true; 
  }, [loggedInUser, router]);

  useEffect(() => { 
    dispatch(clearBoardLoading());
    if (boardId) { 
      dispatch(fetchBoardDetail(boardId)); 
      dispatch(fetchComments(boardId)); 
    } 
  }, [dispatch, boardId]);

  const isPostAuthor = useMemo(() => {
    if (!post || !loggedInUser) return false;
    const myIdentifier = loggedInUser.userIdentifier || loggedInUser.email;
    const myName = loggedInUser.name;

    if (post.writerIdentifier && myIdentifier) {
      return post.writerIdentifier === myIdentifier;
    }
    if (post.writer && myName) {
      return post.writer === myName;
    }
    return false;
  }, [post, loggedInUser]);

  const nestedComments = useMemo((): NestedComment[] => {
    if (!comments || !Array.isArray(comments)) return [];
    const map: { [key: number]: NestedComment } = {};
    const roots: NestedComment[] = [];
    
    comments.forEach(c => { 
      map[c.id] = { ...c, children: [] }; 
    });
    
    comments.forEach(c => { 
      if (c.parentCommentId && map[c.parentCommentId]) { 
        map[c.parentCommentId].children.push(map[c.id]); 
      } else { 
        roots.push(map[c.id]); 
      } 
    });
    return roots;
  }, [comments]);

  const handleCommentSubmit = useCallback(async () => {
    if (!requireLogin()) return; 
    if (!newComment.trim() || !boardId) return;
    try {
      await dispatch(createComment({ boardId, commentContent: newComment })).unwrap();
      setNewComment('');
      dispatch(fetchComments(boardId));
    } catch (err) { 
      alert(`댓글 작성 실패: ${err}`); 
    }
  }, [dispatch, boardId, newComment, requireLogin]);

  const handleReplySubmit = useCallback(async (parentId: number) => {
    if (!requireLogin()) return; 
    if (!replyContent.trim() || !boardId) return;
    try {
      await dispatch(createComment({ 
        boardId, 
        commentContent: replyContent, 
        parentCommentId: parentId 
      })).unwrap();
      setReplyContent(''); 
      setReplyingTo(null); 
      dispatch(fetchComments(boardId));
    } catch (err) { 
      alert(`답글 작성 실패: ${err}`); 
    }
  }, [dispatch, boardId, replyContent, requireLogin]);

  const handleEditPost = useCallback(() => {
    if (!isPostAuthor) {
      alert('본인이 작성한 게시글만 수정할 수 있습니다.');
      return;
    }
    router.push(`/postWrite/${boardId}`);
  }, [router, boardId, isPostAuthor]);

  const handleDeletePost = useCallback(async () => {
    if (!isPostAuthor) {
      alert('본인이 작성한 게시글만 삭제할 수 있습니다.');
      return;
    }

    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try { 
        await dispatch(deleteBoard(boardId)).unwrap(); 
        router.push('/post'); 
      } catch (err) { 
        alert(`삭제 성공`); 
      }
    }
  }, [dispatch, boardId, router, isPostAuthor]);

  // 🔥 타입 에러 수정: comment.content를 제거하고, 오직 존재하는 comment.commentContent만 안전하게 대입합니다.
  const handleStartEditComment = useCallback((comment: Comment) => { 
    if (!requireLogin()) return; 
    setEditingCommentId(comment.id); 
    setEditingContent(comment.commentContent || ''); 
  }, [requireLogin]);

  const handleCancelEditComment = useCallback(() => { 
    setEditingCommentId(null); 
    setEditingContent(''); 
  }, []);

  const handleUpdateComment = useCallback(async () => {
    if (!editingContent.trim() || editingCommentId === null) return;

    const commentToUpdate = comments.find(c => c.id === editingCommentId);
    if (!commentToUpdate) return;

    const myId = loggedInUser?.userIdentifier || loggedInUser?.email;
    const myName = loggedInUser?.name;
    let isCommentAuthor = false;

    if (commentToUpdate.commentWriterIdentifier && myId) {
      isCommentAuthor = commentToUpdate.commentWriterIdentifier === myId;
    } else if ((commentToUpdate.commentWriter || commentToUpdate.writer) && myName) {
      isCommentAuthor = (commentToUpdate.commentWriter || commentToUpdate.writer) === myName;
    }

    if (!isCommentAuthor) {
      alert('본인이 작성한 댓글만 수정할 수 있습니다.');
      return;
    }

    try {
      await dispatch(updateComment({ 
        id: editingCommentId, 
        commentContent: editingContent 
      })).unwrap();
      setEditingCommentId(null); 
      dispatch(fetchComments(boardId));
    } catch (err) { 
      alert(`수정 실패: ${err}`); 
    }
  }, [dispatch, boardId, editingCommentId, editingContent, comments, loggedInUser]);

  const handleDeleteComment = useCallback(async (id: number) => {
    const commentToDelete = comments.find(c => c.id === id);
    if (!commentToDelete) return;

    const myId = loggedInUser?.userIdentifier || loggedInUser?.email;
    const myName = loggedInUser?.name;
    let isCommentAuthor = false;

    if (commentToDelete.commentWriterIdentifier && myId) {
      isCommentAuthor = commentToDelete.commentWriterIdentifier === myId;
    } else if ((commentToDelete.commentWriter || commentToDelete.writer) && myName) {
      isCommentAuthor = (commentToDelete.commentWriter || commentToDelete.writer) === myName;
    }

    if (!isCommentAuthor) {
      alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
      return;
    }

    if (confirm('댓글을 삭제하시겠습니까?')) {
      try { 
        await dispatch(deleteComment(id)).unwrap(); 
        dispatch(fetchComments(boardId)); 
      } catch (err) { 
        alert(`삭제 실패: ${err}`); 
      }
    }
  }, [dispatch, boardId, comments, loggedInUser]);

  const postBodyContent = useMemo(() => {
    if (!post?.content) return { __html: '' };
    const decoded = post.content.includes('&lt;') || post.content.includes('&gt;') ? unescapeHtml(post.content) : post.content;
    return { __html: decoded };
  }, [post?.content]);

  const handleTabClick = useCallback((tab: '지역' | '테마') => () => {
    setActiveTab(tab);
  }, []);

  const handleReplyClick = useCallback((id: number) => {
    if (!requireLogin()) return;
    setReplyingTo(prev => (prev === id ? null : id));
  }, [requireLogin]);

  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  if (loading && !post) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center' }}>에러: {error}</div>;
  if (!post) return <div style={{ padding: '50px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          <SearchBar onSearch={() => {}}/>
        </section>
        
        <div className={styles.contentWrapper}>
          <main className={styles.mainContent}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>{post.title}</h1>
              {isPostAuthor && (
                <div className={styles.postActions}>
                  <button onClick={handleEditPost}>수정</button>
                  <button onClick={handleDeletePost}>삭제</button>
                </div>
              )}
            </div>
            
            <div className={styles.authorInfo}>
              <div 
                className={styles.authorAvatar} 
                style={{ backgroundImage: `url(${getProfileImage(post.writerProfileImageUrl)})` }}
              ></div>
              <span className={styles.authorName}>{post.writer}</span>
              <span className={styles.postDate}>{formatDate(post.createdTime)}</span>
            </div>
            
            {post.thumbnailPublicUrl && (
              <div className={styles.imageGrid}>
                <img src={post.thumbnailPublicUrl} alt="썸네일" />
              </div>
            )}
            
            <div className={styles.postBody} dangerouslySetInnerHTML={postBodyContent} />
            
            <div className={styles.commentsSection}>
              <div className={styles.commentInputWrapper}>
                <div className={styles.commentInputContainer}>
                  <textarea 
                    placeholder={loggedInUser ? "댓글을 남겨주세요 :)" : "로그인 후 이용 가능합니다."} 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    maxLength={200} 
                    disabled={!loggedInUser} 
                  />
                  <span className={styles.charCount}>{newComment.length}/200</span>
                </div>
                <button 
                  className={styles.sendButton} 
                  onClick={handleCommentSubmit} 
                  disabled={loading || !loggedInUser}
                >
                  <Image src="/imgs/comment_send.png" alt="전송" width={48} height={48} />
                </button>
              </div>
              
              <div className={styles.commentList}>
                {nestedComments.length > 0 ? (
                  nestedComments.map(comment => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      isReply={false} 
                      replyingTo={replyingTo} 
                      onReplyClick={handleReplyClick} 
                      onReplySubmit={handleReplySubmit} 
                      replyContent={replyContent} 
                      onReplyContentChange={(e) => setReplyContent(e.target.value)} 
                      loading={loading} 
                      loggedInUser={loggedInUser} 
                      editingCommentId={editingCommentId} 
                      editingContent={editingContent} 
                      onEditingContentChange={(e) => setEditingContent(e.target.value)} 
                      onStartEdit={handleStartEditComment} 
                      onCancelEdit={handleCancelEditComment} 
                      onUpdateComment={handleUpdateComment} 
                      onDeleteComment={handleDeleteComment} 
                    />
                  ))
                ) : <p>아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>}
              </div>
            </div>
          </main>
          
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              {loggedInUser ? (
                <>
                  <div className={styles.profileHeader}>
                    {/* 일반 <img> 태그 사용으로 소셜 CDN 도메인 차단 우회 */}
                    <img 
                      src={getProfileImage(loggedInUser.profileImageUrl)} 
                      alt="프사" 
                      width={50} 
                      height={50} 
                      className={styles.profileImage} 
                    />
                    <p className={styles.username}>{loggedInUser.name}님</p>
                  </div>
                  <div className={styles.profileDivider} />
                  <div className={styles.profileActions}>
                    <button><Image src="/imgs/Popular.png" alt="인기" width={36} height={36} /><span>인기글</span></button>
                    <button onClick={() => router.push('/postWrite')}><Image src="/imgs/writing.png" alt="작성" width={36} height={36} /><span>글쓰기</span></button>
                    <button onClick={() => router.push('/posts/mypost')}><Image src="/imgs/myposts.png" alt="내글" width={36} height={36} /><span>내 글</span></button>
                  </div>
                </>
              ) : (
                <div className={styles.loginContainer}>
                  <p>로그인 후 이용해보세요!</p>
                  <button className={styles.loginButton} onClick={() => router.push('/login')}>로그인</button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;