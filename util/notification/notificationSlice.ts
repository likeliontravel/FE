'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

export type NotificationType = 'COMMENT' | 'GROUP_JOIN' | 'SCHEDULE_REMINDER';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  targetId: number; // 게시글 ID, 그룹 ID, 또는 일정 ID
  groupName: string | null;
  actorId: number;
  actorName: string;
  actorProfileImageUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  notifications: NotificationItem[];
  nextCursor: number | null;
  hasNext: boolean;
  unreadCount: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  nextCursor: number | null;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  nextCursor: null,
  hasNext: false,
  loading: false,
  error: null,
};

// 1. 알림 목록 조회 (커서 페이징) - GET /notification?lastNotificationId={id}&size={size}
export const fetchNotifications = createAsyncThunk<
  NotificationListResponse,
  { lastNotificationId?: number | null; size?: number; isRefresh?: boolean } | void
>(
  'notification/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const lastId = params?.lastNotificationId;
      const size = params?.size || 20;
      const query = lastId ? `?lastNotificationId=${lastId}&size=${size}` : `?size=${size}`;
      
      const response = await api.get(`/notification${query}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '알림 목록 조회 실패');
    }
  }
);

// 2. 안 읽은 알림 개수 조회 - GET /notification/unread-count
export const fetchUnreadCount = createAsyncThunk<number>(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notification/unread-count');
      return response.data.data.unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '안읽은 알림 조회 실패');
    }
  }
);

// 3. 알림 단건 읽음 처리 - PATCH /notification/{id}/read
export const markNotificationAsRead = createAsyncThunk<number, number>(
  'notification/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/notification/${id}/read`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '알림 읽음 처리 실패');
    }
  }
);

// 4. 알림 전체 읽음 처리 - PATCH /notification/read-all
export const markAllNotificationsAsRead = createAsyncThunk<number>(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/notification/read-all');
      return response.data.data; // 읽음 처리된 알림 건수
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '전체 읽음 처리 실패');
    }
  }
);

// 5. 알림 삭제 - DELETE /notification/{id}
export const deleteNotification = createAsyncThunk<number, number>(
  'notification/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notification/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '알림 삭제 실패');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    //SSE로 실시간 알림 수신 시 목록 맨 앞에 추가
    addRealtimeNotification: (state, action: PayloadAction<NotificationItem>) => {
      // 중복 방지
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    // SSE 연결 직후 안읽은 개수 동기화
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.nextCursor = null;
      state.hasNext = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // 목록 조회
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { notifications, nextCursor, hasNext, unreadCount } = action.payload;
        
        // 첫 페이지 조회(새로고침)면 덮어쓰고, 다음 페이지면 누적
        if (action.meta.arg && (action.meta.arg as any).isRefresh) {
          state.notifications = notifications;
        } else if (!action.meta.arg || !(action.meta.arg as any).lastNotificationId) {
          state.notifications = notifications;
        } else {
          // 중복 ID 방지하며 누적
          const existingIds = new Set(state.notifications.map(n => n.id));
          const newUnique = notifications.filter(n => !existingIds.has(n.id));
          state.notifications.push(...newUnique);
        }
        
        state.nextCursor = nextCursor;
        state.hasNext = hasNext;
        state.unreadCount = unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 안 읽은 개수 조회
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
      })

      // 단건 읽음 처리
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<number>) => {
        const item = state.notifications.find(n => n.id === action.payload);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // 전체 읽음 처리
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.read = true; });
        state.unreadCount = 0;
      })

      // 삭제
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<number>) => {
        const item = state.notifications.find(n => n.id === action.payload);
        if (item && !item.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });
  },
});

export const { addRealtimeNotification, setUnreadCount, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;