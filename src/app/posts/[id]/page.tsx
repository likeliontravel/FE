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
  Comment 
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
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
};

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
  comment: NestedComment, 
  isReply: boolean,
  replyingTo: number | null,
  onReplyClick: (id: number) => void,
  onReplySubmit: (id: number) => void,
  replyContent: string,
  onReplyContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  loading: boolean,
  loggedInUser: any,
  editingCommentId: number | null,
  editingContent: string,
  onEditingContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  onStartEdit: (comment: Comment) => void,
  onCancelEdit: () => void,
  onUpdateComment: () => void,
  onDeleteComment: (id: number) => void,
}) => {
  const isEditing = editingCommentId === comment.id;
  const isAuthor = loggedInUser && loggedInUser.userIdentifier === comment.commentWriterIdentifier;

  return (
    <div className={isReply ? styles.replyItem : styles.commentItem}>
      {isReply && (
        <div className={styles.replyArrow}>
          <Image 
            src="/imgs/reply.png" 
            alt="대댓글 화살표" 
            width={20}
            height={20}
          />
        </div>
      )}
      <img src={comment.commentWriterProfileImageUrl || '/imgs/default-profile.png'} alt={comment.commentWriter} className={styles.commentAvatar} />
      <div className={styles.commentBody}>
        <span className={styles.commentAuthor}>{comment.commentWriter}</span>
        
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
          <span className={styles.commentDate}>{formatDate(comment.commentCreatedTime)}</span>
          {!isReply && (
            <button onClick={() => onReplyClick(comment.id)}>
              <Image src="/imgs/message-square.png" alt="답글 달기" width={16} height={16} />
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
              {loading ? '...' : <Image src="/imgs/comment_send.png" alt="답글 전송" width={48} height={48} />}
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

const PostDetail = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth);
  const { post, comments, loading, error } = useSelector((state: RootState) => state.board);

  const id = params.id ? parseInt(Array.isArray(params.id) ? params.id[0] : params.id, 10) : 0;
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const isPostAuthor = loggedInUser && post && loggedInUser.userIdentifier === post.writerIdentifier;

  useEffect(() => {
    if (id && !isNaN(id)) {
      dispatch(fetchBoardDetail(id));
      dispatch(fetchComments(id));
    }
  }, [dispatch, id]);

  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim() || !id) return;
    try {
      await dispatch(createComment({ boardId: id, commentContent: newComment })).unwrap();
      setNewComment('');
      dispatch(fetchComments(id));
    } catch (err) {
      alert(`댓글 작성 실패: ${err}`);
    }
  }, [dispatch, id, newComment]);

  const handleReplySubmit = useCallback(async (parentId: number) => {
    if (!replyContent.trim() || !id) return;
    try {
      await dispatch(createComment({ boardId: id, commentContent: replyContent, parentCommentId: parentId })).unwrap();
      setReplyContent('');
      setReplyingTo(null);
      dispatch(fetchComments(id));
    } catch (err) {
      alert(`답글 작성 실패: ${err}`);
    }
  }, [dispatch, id, replyContent]);

  const handleEditPost = useCallback(() => {
    router.push(`/post/edit/${id}`);
  }, [router, id]);

  const handleDeletePost = useCallback(async () => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteBoard(id)).unwrap();
        alert('게시글이 삭제되었습니다.');
        router.push('/post');
      } catch (err) {
        alert(`게시글 삭제 실패: ${err}`);
      }
    }
  }, [dispatch, id, router]);

  const handleStartEditComment = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.commentContent);
  }, []);

  const handleCancelEditComment = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  const handleUpdateComment = useCallback(async () => {
    if (!editingContent.trim() || !editingCommentId) return;
    try {
      await dispatch(updateComment({ id: editingCommentId, commentContent: editingContent, boardId: id })).unwrap();
      handleCancelEditComment();
      dispatch(fetchComments(id));
    } catch (err) {
      alert(`댓글 수정 실패: ${err}`);
    }
  }, [dispatch, id, editingCommentId, editingContent, handleCancelEditComment]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
        dispatch(fetchComments(id));
      } catch (err) {
        alert(`댓글 삭제 실패: ${err}`);
      }
    }
  }, [dispatch, id]);

  const nestedComments = useMemo((): NestedComment[] => {
    if (!comments) return [];
    const commentMap: Record<number, NestedComment> = {};
    const result: NestedComment[] = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, children: [] };
    });

    comments.forEach(comment => {
      if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
        commentMap[comment.parentCommentId].children.push(commentMap[comment.id]);
      } else {
        result.push(commentMap[comment.id]);
      }
    });

    return result;
  }, [comments]);

  const postBodyContent = useMemo(() => {
    if (!post?.content) return { __html: '' };
    if (typeof window === 'undefined') return { __html: '' };
    try {
      const parser = new DOMParser();
      const decodedString = parser.parseFromString(`<!doctype html><body>${post.content}`, 'text/html').body.textContent;
      return { __html: decodedString || '' };
    } catch (e) {
      return { __html: post.content };
    }
  }, [post?.content]);

  const handleTabClick = useCallback((tab: '지역' | '테마') => () => setActiveTab(tab), []);
  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
  const handleReplyClick = useCallback((id: number) => {
    setReplyingTo(prev => (prev === id ? null : id));
  }, []);
  
  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  if (loading && !post) return <div style={{ padding: '50px', textAlign: 'center' }}>게시글을 불러오는 중...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center' }}>에러가 발생했습니다: {error}</div>;
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
              <div className={styles.authorAvatar} style={{ backgroundImage: `url(${post.writerProfileImageUrl || '/imgs/default-profile.png'})` }}></div>
              <span className={styles.authorName}>{post.writer}</span>
              <span className={styles.postDate}>{formatDate(post.createdTime)}</span>
            </div>
            <div className={styles.imageGrid}>
              <img src={post.thumbnailPublicUrl || '/imgs/default-thumbnail.png'} alt={post.title} />
            </div>
            <div className={styles.postBody} dangerouslySetInnerHTML={postBodyContent} />
            
            <div className={styles.commentsSection}>
              <div className={styles.commentInputWrapper}>
                <div className={styles.commentInputContainer}>
                  <textarea
                    placeholder="따뜻한 댓글을 남겨주세요 :)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={200}
                  />
                  <span className={styles.charCount}>{newComment.length}/200</span>
                </div>
                <button className={styles.sendButton} onClick={handleCommentSubmit} disabled={loading}>
                  {loading ? '...' : <Image src="/imgs/comment_send.png" alt="댓글 전송" width={48} height={48} />}
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