'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  NotificationItem,
} from '../../../util/notification/notificationSlice';
import styles from '../../../styles/component/NotificationModal.module.scss'; 
import Image from 'next/image';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 상대 시간 포맷팅 헬퍼
const formatRelativeTime = (dateString: string) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 프로필 이미지 헬퍼
const getProfileImage = (url: string | null | undefined): string => {
  if (!url || url === 'null' || url.trim() === '') return '/imgs/default-profile.png';
  return url;
};

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const modalRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, nextCursor, hasNext, loading } = useSelector(
    (state: RootState) => state.notification
  );

  // 모달 열릴 때 최신 알림 1페이지 조회
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications({ isRefresh: true, size: 20 }));
    }
  }, [isOpen, dispatch]);

  // 외부 영역 클릭 시 모달 닫기
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleItemClick = useCallback(
    async (item: NotificationItem) => {
      if (!item.read) {
        dispatch(markNotificationAsRead(item.id));
      }

      onClose();

      switch (item.type) {
        case 'COMMENT':
          router.push(`/posts/${item.targetId}`);
          break;
        case 'GROUP_JOIN':
          router.push(`/group/${item.targetId}`);
          break;
        case 'SCHEDULE_REMINDER':
          router.push(`/schedule/${item.targetId}`);
          break;
        default:
          break;
      }
    },
    [dispatch, router, onClose]
  );

  // 전체 읽음 처리
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  // 단건 삭제
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  // 다음 페이지 더보기 (커서 페이징)
  const handleLoadMore = () => {
    if (hasNext && nextCursor && !loading) {
      dispatch(fetchNotifications({ lastNotificationId: nextCursor, size: 20 }));
    }
  };

  if (!isOpen) return null;

  // 알림 유형별 뱃지 아이콘
  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'COMMENT':
        return <span className={styles.typeBadgeComment}>💬 댓글</span>;
      case 'GROUP_JOIN':
        return <span className={styles.typeBadgeGroup}>👥 그룹</span>;
      case 'SCHEDULE_REMINDER':
        return <span className={styles.typeBadgeSchedule}>⏰ 일정</span>;
      default:
        return <span className={styles.typeBadgeDefault}>📢 알림</span>;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.notificationCard} ref={modalRef}>
        <div className={styles.arrow} />

        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>알림</h3>
            {unreadCount > 0 && <span className={styles.unreadCountBadge}>{unreadCount}</span>}
          </div>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
              모두 읽음
            </button>
          )}
        </div>

        {/* 알림 목록 */}
        <div className={styles.listContainer}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🐻</div>
              <p className={styles.emptyTitle}>새로운 알림이 없어요!</p>
              <span className={styles.emptySub}>메이트들과 새로운 여행을 시작해보세요.</span>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`${styles.notiItem} ${!item.read ? styles.unread : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {/* 행위자 프로필 이미지 */}
                <img
                  src={getProfileImage(item.actorProfileImageUrl)}
                  alt={item.actorName || '프로필'}
                  className={styles.avatar}
                />

                <div className={styles.contentBox}>
                  <div className={styles.itemTop}>
                    {getTypeBadge(item.type)}
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(item.id, e)}
                      title="알림 삭제"
                    >
                      ✕
                    </button>
                  </div>

                  <p className={styles.message}>{item.message}</p>

                  <div className={styles.itemBottom}>
                    <span className={styles.time}>{formatRelativeTime(item.createdAt)}</span>
                    {item.groupName && (
                      <span className={styles.groupTag}>📍 {item.groupName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* 커서 페이징 더보기 버튼 */}
          {hasNext && (
            <div className={styles.loadMoreWrapper}>
              <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loading}>
                {loading ? '불러오는 중...' : '이전 알림 더보기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}