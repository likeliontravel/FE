'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../../../styles/postDetail/postDetail.module.scss';
import SearchBar from '../../SearchBar/SearchBar';
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  writer: string;
  content: string;
  image1: string;
  image2: string;
}

const testPosts: Post[] = [
  {
    id: 1,
    title: '여수 1박2일 여행 후기 + 숙소 꿀팁 전수해요🙌',
    writer: '여정',
    content:
      '오동도에서 동백꽃 구경하고, 저녁엔 케이블카 타고 여수 밤바다 구경했어요! 밤이 되니까 반짝이는 조명들이 더 이쁜 느낌.. 특히 케이블카를 타고 내려다본 야경은 꼭 보시는걸 추천..! 근처 카페에서 따뜻한 커피 한 잔 마시면서 바라본 바다도 한껏 닮았습니다.. 이런 곳이라면 하루 종일 있어도 지루하지 않을 것 같아요!*´-`v\n\n저희는 숙소의 경우 아고다를 이용해서 예약했어요! 아고다의 경우 가격차이가 꽤 있는 사이트이기 때문에... 바로 자사 웹사이트 방문보다는 가격 비교 웹사이트에서 링크타고 들어가는게 더 저렴하게 이용가능합니다..! 여러분도 현명한 소비하세요!',
    image1: '/imgs/Post_img1.png',
    image2: '/imgs/Post_img2.png',
  },
  {
    id: 2,
    title: '올만에 가족들과 여수에서 보내는 여유로운 하루',
    writer: '토리',
    content:
      '여수에 오면 여유가 가득해지는 것 같아요. 이번엔 낮엔 오동도에서 자연을 즐기고, 밤엔 카페에서 여수 밤바다를 바라보며..',
    image1: '/imgs/sample2.jpg',
    image2: '/imgs/sample3.jpg',
  },
  {
    id: 3,
    title: '여수 바다와 산책로를 따라',
    writer: '푸른하늘',
    content:
      '아름다운 해안선을 따라 걷는 것만으로도 힐링이 되는 시간이었어요. 잠시 복잡한 일상에서 벗어나..',
    image1: '/imgs/sample3.jpg',
    image2: '/imgs/sample4.png',
  },
  {
    id: 4,
    title: '여수 밤바다의 낭만, 그리고 맛집 탐방',
    writer: '미식가',
    content:
      '여수에 도착하자마자 돌산대교를 건너 바로 케이블카를 탔어요. 그림 같았던 노을과 야경이 아직도 생생합니다. 저녁엔..',
    image1: '/imgs/sample4.png',
    image2: '/imgs/sample1.png',
  },
];

const dummyComments = [
  {
    id: 1,
    author: 'rin102',
    avatar: '/images/profile-rin.png',
    content:
      '혹시 숙소 OO라운지 맞을까요? 저희도 요번달에 예약하려하는데 숙소 컨디션 궁금해요. ㅁㅁ카페 웨이팅은 보통 어느정도 기다리셨나요..!',
    replies: [
      {
        id: 101,
        author: '여정',
        avatar: '/images/profile-author.png',
        content:
          '안녕하세요! 네, 숙소 OO라운지 맞습니다 😊 저희가 갔을 때 숙소 컨디션은 청결해서 괜찮다고 느꼈어요! ㅁㅁ카페는 주말 피크타임 기준 약 30분 정도 기다렸어요. 시간대에 따라 웨이팅 차이가 있을 수 있으니, 가능한 한 일찍 가시는게 나을듯해요!',
      },
    ],
  },
  {
    id: 2,
    author: '여유한잔',
    avatar: '/images/profile-other.png',
    content:
      '어머 사진 너무 이쁜데요?? 저도 저번 가족여행으로 여수 가봤는데 갑자기 추억이 새록새록하네요 ㅋㅋ 숙소예약은 아고다가 더 나은가요? 항상 네이버로만 구매하는편이라~',
    replies: [],
  },
];

const regionKeywords = [
  '서울',
  '인천',
  '대전',
  '대구',
  '광주',
  '부산',
  '울산',
  '경기',
  '강원',
  '충북',
  '충남',
  '세종',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '가평',
  '양양',
  '강릉',
  '경주',
  '전주',
  '여수',
  '춘천',
  '홍천',
  '태안',
  '통영',
  '거제',
  '포항',
  '안동',
];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

const PostDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'지역' | '테마'>('지역');
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      const postId = parseInt(id as string, 10);
      const fetchedPost = testPosts.find((p) => p.id === postId) || null;
      setPost(fetchedPost);
      setLoading(false);
    }
  }, [id]);

  const handleTabClick = useCallback(
    (tab: '지역' | '테마') => () => setActiveTab(tab),
    []
  );
  const goToPostWrite = useCallback(() => router.push('/postWrite'), [router]);
  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value);
    },
    []
  );

  const postBodyContent = useMemo(() => {
    if (!post?.content) return { __html: '' };
    return { __html: post.content.replace(/\n/g, '<br />') };
  }, [post?.content]);

  const currentKeywords = activeTab === '지역' ? regionKeywords : themeKeywords;

  if (loading) return <div>게시글을 불러오는 중...</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </section>

        <div className={styles.contentWrapper}>
          <main className={styles.mainContent}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}></div>
              <span className={styles.authorName}>{post.writer}</span>
            </div>
            <div className={styles.imageGrid}>
              <img src={post.image1} alt="게시글 이미지 1" />
              <img src={post.image2} alt="게시글 이미지 2" />
            </div>
            <p
              className={styles.postBody}
              dangerouslySetInnerHTML={postBodyContent}
            />

            <div className={styles.commentsSection}>
              <div className={styles.commentInputWrapper}>
                <div className={styles.commentInputContainer}>
                  <textarea
                    placeholder="안녕하세요!"
                    value={comment}
                    onChange={handleCommentChange}
                    maxLength={200}
                  />
                  <span className={styles.charCount}>{comment.length}/200</span>
                </div>
                <button className={styles.sendButton}>
                  <Image
                    src="/imgs/comment_send.png"
                    alt="댓글 전송"
                    width={48}
                    height={48}
                  />
                </button>
              </div>

              <div className={styles.commentList}>
                {dummyComments.map((c) => (
                  <Fragment key={c.id}>
                    <div className={styles.commentItem}>
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentBody}>
                        <span className={styles.commentAuthor}>{c.author}</span>
                        <p className={styles.commentText}>{c.content}</p>
                        <div className={styles.commentMeta}>
                          <button>
                            <Image
                              src="/imgs/message-square.png"
                              alt="댓글 수"
                              width={16}
                              height={16}
                            />
                            <span>{c.replies.length}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {c.replies && c.replies.length > 0 && (
                      <div className={styles.repliesContainer}>
                        {c.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`${styles.commentItem} ${styles.replyItem}`}
                          >
                            <img
                              src={reply.avatar}
                              alt={reply.author}
                              className={styles.commentAvatar}
                            />
                            <div className={styles.commentBody}>
                              <span className={styles.commentAuthor}>
                                {reply.author}
                              </span>
                              <p className={styles.commentText}>
                                {reply.content}
                              </p>
                              <div className={styles.commentMeta}>
                                <button>
                                  <Image
                                    src="/imgs/message-square.png"
                                    alt="댓글 수"
                                    width={16}
                                    height={16}
                                  />
                                  <span>0</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <img
                  src="/images/profile.png"
                  alt="profile"
                  className={styles.profileImage}
                />
                <p className={styles.username}>린님</p>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileActions}>
                <button>
                  <img src="/imgs/Popular.png" alt="인기글" />
                  <span>인기글 보기</span>
                </button>
                <button onClick={goToPostWrite}>
                  <img src="/imgs/writing.png" alt="글쓰기" />
                  <span>글쓰기</span>
                </button>
                <button>
                  <img src="/imgs/myposts.png" alt="내 글" />
                  <span>내 글보기</span>
                </button>
              </div>
            </div>
            <div className={styles.categoryContainer}>
              <div className={styles.categoryTabs}>
                <button
                  className={`${styles.categoryTab} ${activeTab === '지역' ? styles.active : ''}`}
                  onClick={handleTabClick('지역')}
                >
                  지역
                </button>
                <button
                  className={`${styles.categoryTab} ${activeTab === '테마' ? styles.active : ''}`}
                  onClick={handleTabClick('테마')}
                >
                  테마
                </button>
              </div>
              <div className={styles.categoryItems}>
                {currentKeywords.map((keyword) => (
                  <span key={keyword} className={styles.categoryItem}>
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

export default PostDetail;
