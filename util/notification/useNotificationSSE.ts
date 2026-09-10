'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { addRealtimeNotification, setUnreadCount } from './notificationSlice';

export function useNotificationSSE() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth || {});
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    //로그아웃 상태면 연결 해제
    if (!user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    if (eventSourceRef.current) return;

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://toleave.cloud';
    const sseUrl = `${baseURL}/notification/subscribe`;

    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // 1. 연결 성공 이벤트 (connect)
    eventSource.addEventListener('connect', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.unreadCount === 'number') {
          dispatch(setUnreadCount(data.unreadCount));
        }
      } catch (err) {
        console.error('SSE connect parse error:', err);
      }
    });

    // 2. 실시간 알림 이벤트 (notification)
    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const newNoti = JSON.parse(e.data);
        dispatch(addRealtimeNotification(newNoti));

        // 브라우저 기본 알림 띄우기 (선택 사항)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('투리브 알림', { body: newNoti.message });
        }
      } catch (err) {
        console.error('SSE notification parse error:', err);
      }
    });

    // 3. 에러 발생 시 처리
    eventSource.onerror = (err) => {
      // 401 인증 만료 또는 서버 연결 유실 시 자동 재연결 처리
      console.warn('SSE 연결 상태 변경:', err);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, dispatch]);
}