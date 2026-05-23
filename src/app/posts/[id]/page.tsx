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
} from '../../../../util/board/boardSilce';
import styles from '../../../../styles/postDetail/postDetail.module.scss';
import SearchBar from '../../SearchBar/SearchBar';
import Image from 'next/image';

const regionKeywords = ['서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'];
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

// --- 개별 댓글 아이템 (구조 복구) ---
const CommentItem = ({ 
  comment, isReply, replyingTo, onReplyClick, onReplySubmit, replyContent, onReplyContentChange,
  loading, loggedInUser, editingCommentId, editingContent, onEditingContentChange,
  onStartEdit, onCancelEdit, onUpdateComment, onDeleteComment
}: { 
  comment: NestedComment, isReply: boolean, replyingTo: number | null, onReplyClick: (id: number) => void,
  onReplySubmit: (id: number) => void, replyContent: string, onReplyContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  loading: boolean, loggedInUser: any, editingCommentId: number | null, editingContent: string,
  onEditingContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  onStartEdit: (comment: Comment) => void, onCancelEdit: () => void, onUpdateComment: () => void, onDeleteComment: (id: number) => void,
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
      <img src={comment.commentWriterProfileImageUrl || '/imgs/default-profile.png'} alt="프사" className={styles.commentAvatar} />
      <div className={styles.commentBody}>
        <span className={styles.commentAuthor}>{comment.commentWriter}</span>
        
        {isEditing ? (
          <div className={styles.editCommentForm}>
            <textarea value={editingContent} onChange={onEditingContentChange} maxLength={200} autoFocus />
            <div className={styles.editActions}>
              <button onClick={onCancelEdit}>취소</button>
              <button onClick={onUpdateComment} disabled={loading}>저장</button>
            </div>
          </div>
        ) : (
          <p className={styles.commentText}>{comment.commentContent}</p>
        )}

        <div className={styles.commentMeta}>
          <span className={styles.commentDate}>{formatDate(comment.commentCreatedTime)}</span>
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
        
        {/* 답글 입력창 (구조 복구) */}
        {replyingTo === comment.id && (
          <div className={styles.commentInputWrapper} style={{marginTop: '15px'}}>
            <div className={styles.commentInputContainer}>
              <textarea 
                placeholder={`@${comment.commentWriter}님에게 답글 남기기`} 
                value={replyContent} 
                onChange={onReplyContentChange} 
                maxLength={200} 
                autoFocus 
              />
              <span className={styles.charCount}>{replyContent.length}/200</span>
            </div>
            <button className={styles.sendButton} onClick={() => onReplySubmit(comment.id)} disabled={loading}>
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
  const { post, comments, loading } = useSelector((state: RootState) => state.board || {});
  const boardId = useMemo(() => params.id ? parseInt(Array.isArray(params.id) ? params.id[0] : params.id, 10) : 0, [params.id]);
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => { 
    dispatch(clearBoardLoading());
    if (boardId) { dispatch(fetchBoardDetail(boardId)); dispatch(fetchComments(boardId)); } 
  }, [dispatch, boardId]);

  const isPostAuthor = loggedInUser && post && loggedInUser.userIdentifier === post.writerIdentifier;

  const nestedComments = useMemo((): NestedComment[] => {
    if (!comments || !Array.isArray(comments)) return [];
    const map: { [key: number]: NestedComment } = {};
    const roots: NestedComment[] = [];
    comments.forEach(c => { map[c.id] = { ...c, children: [] }; });
    comments.forEach(c => { 
      if (c.parentCommentId && map[c.parentCommentId]) { map[c.parentCommentId].children.push(map[c.id]); } 
      else { roots.push(map[c.id]); } 
    });
    return roots;
  }, [comments]);

  const handleCommentSubmit = useCallback(async () => {
    if (!loggedInUser) { alert('로그인이 필요합니다.'); return; }
    if (!newComment.trim() || !boardId) return;
    try {
      await dispatch(createComment({ boardId, commentContent: newComment })).unwrap();
      setNewComment('');
      dispatch(fetchComments(boardId));
    } catch (err) { alert(`댓글 작성 실패: ${err}`); }
  }, [dispatch, boardId, newComment, loggedInUser]);

  const handleReplySubmit = useCallback(async (parentId: number) => {
    if (!loggedInUser) { alert('로그인이 필요합니다.'); return; }
    if (!replyContent.trim() || !boardId) return;
    try {
      await dispatch(createComment({ boardId, commentContent: replyContent, parentCommentId: parentId })).unwrap();
      setReplyContent(''); setReplyingTo(null); dispatch(fetchComments(boardId));
    } catch (err) { alert(`답글 작성 실패: ${err}`); }
  }, [dispatch, boardId, replyContent, loggedInUser]);

  const handleUpdateComment = useCallback(async () => {
    if (!editingContent.trim() || editingCommentId === null) return;
    try {
      await dispatch(updateComment({ id: editingCommentId, commentContent: editingContent })).unwrap();
      setEditingCommentId(null); dispatch(fetchComments(boardId));
    } catch (err) { alert(`수정 실패: ${err}`); }
  }, [dispatch, boardId, editingCommentId, editingContent]);

  const handleDeleteComment = useCallback(async (id: number) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      try { await dispatch(deleteComment(id)).unwrap(); dispatch(fetchComments(boardId)); }
      catch (err) { alert(`삭제 실패: ${err}`); }
    }
  }, [dispatch, boardId]);

  const postBodyContent = useMemo(() => {
    if (!post?.content) return { __html: '' };
    const decoded = post.content.includes('&lt;') || post.content.includes('&gt;') ? unescapeHtml(post.content) : post.content;
    return { __html: decoded };
  }, [post?.content]);

  if (loading && !post) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
  if (!post) return <div style={{ padding: '50px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}><SearchBar onSearch={() => {}}/></section>
        <div className={styles.contentWrapper}>
          <main className={styles.mainContent}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>{post.title}</h1>
              {isPostAuthor && (
                <div className={styles.postActions}>
                  <button onClick={() => router.push(`/postWrite/${boardId}`)}>수정</button>
                  <button onClick={async () => { if(confirm('삭제?')) { await dispatch(deleteBoard(boardId)).unwrap(); router.push('/post'); }}}>삭제</button>
                </div>
              )}
            </div>
            
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar} style={{ backgroundImage: `url(${post.writerProfileImageUrl || '/imgs/default-profile.png'})` }}></div>
              <span className={styles.authorName}>{post.writer}</span>
              <span className={styles.postDate}>{formatDate(post.createdTime)}</span>
            </div>

            {post.thumbnailPublicUrl && (<div className={styles.imageGrid}><img src={post.thumbnailPublicUrl} alt="썸네일" /></div>)}
            <div className={styles.postBody} dangerouslySetInnerHTML={postBodyContent} />
            
            <div className={styles.commentsSection}>
              {/* 메인 댓글 입력창 (구조 복구) */}
              <div className={styles.commentInputWrapper}>
                <div className={styles.commentInputContainer}>
                  <textarea 
                    placeholder={loggedInUser ? "따뜻한 댓글을 남겨주세요 :)" : "댓글을 작성하려면 로그인해주세요."} 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    maxLength={200} 
                    disabled={!loggedInUser}
                  />
                  <span className={styles.charCount}>{newComment.length}/200</span>
                </div>
                <button className={styles.sendButton} onClick={handleCommentSubmit} disabled={loading || !loggedInUser}>
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
                      onReplyClick={(id) => setReplyingTo(prev => (prev === id ? null : id))} 
                      onReplySubmit={handleReplySubmit} 
                      replyContent={replyContent} 
                      onReplyContentChange={(e) => setReplyContent(e.target.value)} 
                      loading={loading} 
                      loggedInUser={loggedInUser} 
                      editingCommentId={editingCommentId} 
                      editingContent={editingContent} 
                      onEditingContentChange={(e) => setEditingContent(e.target.value)} 
                      onStartEdit={(c) => { setEditingCommentId(c.id); setEditingContent(c.commentContent); }} 
                      onCancelEdit={() => setEditingCommentId(null)} 
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
                    <Image src={loggedInUser.profileImageUrl || "/imgs/default-profile.png"} alt="프사" width={50} height={50} className={styles.profileImage} />
                    <p className={styles.username}>{loggedInUser.name}님</p>
                  </div>
                  <div className={styles.profileDivider} />
                  <div className={styles.profileActions}>
                    <button><Image src="/imgs/Popular.png" alt="인기" width={36} height={36} /><span>인기글 보기</span></button>
                    <button onClick={() => router.push('/postWrite')}><Image src="/imgs/writing.png" alt="작성" width={36} height={36} /><span>글쓰기</span></button>
                    <button onClick={() => router.push('/posts/mypost')}><Image src="/imgs/myposts.png" alt="내글" width={36} height={36} /><span>내 글보기</span></button>
                  </div>
                </>
              ) : (
                <div className={styles.loginContainer}>
                  <p className={styles.loginPrompt}>로그인하고 더 많은 기능을 이용해보세요!</p>
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