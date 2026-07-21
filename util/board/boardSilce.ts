'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { api, publicApi } from '../api';

export interface Board {
  id: number;
  title: string;
  content: string;
  writer: string;
  writerIdentifier: string;
  boardHits: number;
  theme: string;
  region: string;
  thumbnailPublicUrl: string | null;
  createdTime: string;
  updatedTime: string;
  writerProfileImageUrl?: string | null;
}

export interface Comment {
  id: number;
  commentWriter?: string; 
  writer?: string; 
  commentWriterIdentifier?: string;
  commentWriterProfileImageUrl?: string | null;
  commentContent: string; 
  content?: string; 
  boardId: number;
  parentCommentId: number | null;
  commentCreatedTime: string;
  childComments: Comment[];
}

interface BoardState {
  posts: Board[];
  post: Board | null;
  comments: Comment[];
  pagination: {
    totalPages: number;
    totalElements: number;
    currentPage: number;
    isLast: boolean;
  };
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BoardState = {
  posts: [],
  post: null,
  comments: [],
  pagination: {
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    isLast: false,
  },
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async ({ page = 0, size = 30, sortType = 'RECENT', region, theme, searchKeyword }: { 
    page?: number; size?: number; sortType?: string; region?: string; theme?: string; searchKeyword?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board', { 
        params: { page, size, sortType, region, theme, searchKeyword } 
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '목록 조회 실패');
    }
  }
);

export const fetchBoardsByRegion = createAsyncThunk(
  'board/fetchBoardsByRegion',
  async (args: { region: string; page?: number; size?: number; sortType?: string }, { dispatch }) => {
    const result = await dispatch(fetchBoards(args));
    return result.payload;
  }
);

export const fetchBoardsByTheme = createAsyncThunk(
  'board/fetchBoardsByTheme',
  async (args: { theme: string; page?: number; size?: number; sortType?: string }, { dispatch }) => {
    const result = await dispatch(fetchBoards(args));
    return result.payload;
  }
);

export const searchBoards = createAsyncThunk(
  'board/searchBoards',
  async (args: { searchKeyword: string; page?: number; size?: number; sortType?: string }, { dispatch }) => {
    const result = await dispatch(fetchBoards(args));
    return result.payload;
  }
);

// 🔥 수정 완료: 이메일 또는 이름 어느 것으로도 내 글이 매칭될 수 있도록 필터링 다변화
export const fetchMyBoards = createAsyncThunk(
  'board/fetchMyBoards',
  async (userIdentifier: string, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board', { params: { page: 0, size: 1000, sortType: 'RECENT' } });
      const allPosts: Board[] = response.data.data.content;
      
      return allPosts.filter(post => 
        (post.writerIdentifier && post.writerIdentifier === userIdentifier) || 
        (post.writer && post.writer === userIdentifier)
      );
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '내 게시글 조회 실패');
    }
  }
);

export const fetchBoardDetail = createAsyncThunk<Board, number>(
  'board/fetchBoardDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await publicApi.get(`/board/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '상세 조회 실패');
    }
  }
);

export const fetchComments = createAsyncThunk<Comment[], number>(
  'board/fetchComments',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await publicApi.get(`/comment/${boardId}`);
      const rawData = response.data.data;
      if (Array.isArray(rawData)) return rawData;
      if (rawData && Array.isArray(rawData.content)) return rawData.content;
      return [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      return rejectWithValue('댓글 조회 실패');
    }
  }
);

export const uploadImage = createAsyncThunk<string, File>(
  'board/uploadImage',
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const response = await api.post('/board/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '이미지 업로드 실패');
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (newPost: { title: string; content: string; theme: string; region: string; thumbnailPublicUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/board', newPost);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '작성 실패');
    }
  }
);

export const updateBoard = createAsyncThunk<Board, { id: number; title: string; content: string; theme: string; region: string; thumbnailPublicUrl?: string }>(
  'board/updateBoard',
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/board/${id}`, updateData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '수정 실패');
    }
  }
);

export const deleteBoard = createAsyncThunk<number, number>(
  'board/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/board/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '삭제 실패');
    }
  }
);

export const createComment = createAsyncThunk<any, { boardId: number; commentContent: string; parentCommentId?: number | null }>(
  'board/createComment',
  async ({ boardId, commentContent, parentCommentId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comment/${boardId}`, { content: commentContent, parentCommentId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '댓글 작성 실패');
    }
  }
);

export const updateComment = createAsyncThunk<any, { id: number; commentContent: string }>(
  'board/updateComment',
  async ({ id, commentContent }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comment/${id}`, { content: commentContent });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '댓글 수정 실패');
    }
  }
);

export const deleteComment = createAsyncThunk<number, number>(
  'board/deleteComment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/comment/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '댓글 삭제 실패');
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearBoardLoading: (state) => {
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith("board/") && action.type.endsWith('/fulfilled') && action.payload?.content,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.posts = action.payload.content;
          state.pagination = {
            totalPages: action.payload.totalPages,
            totalElements: action.payload.totalElements,
            currentPage: action.payload.number,
            isLast: action.payload.last,
          };
        }
      )
      .addMatcher((action) => action.type.startsWith("board/") && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        (action) => action.type.startsWith("board/") && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher((action) => action.type.startsWith("board/") && action.type.endsWith('/rejected'), (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBoardLoading } = boardSlice.actions;
export default boardSlice.reducer;