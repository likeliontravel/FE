import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://localhost:8080';
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// 타입 정의 (API 명세서에 맞춰 수정)
export interface Board {
  id: number;
  title: string;
  content: string;
  writer: string;
  boardHits: number;
  theme: string;
  region: string;
  thumbnailPublicUrl: string | null;
  createdTime: string;
  updatedTime: string;
  writerProfileImageUrl?: string | null;
}

interface Comment {
  id: number;
  commentWriter: string;
  commentWriterIdentifier: string;
  commentWriterProfileImageUrl: string | null;
  commentContent: string;
  boardId: number;
  parentCommentId: number | null;
  commentCreatedTime: string;
}

interface BoardState {
  posts: Board[];
  post: Board | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  posts: [],
  post: null,
  comments: [],
  loading: false,
  error: null,
};


// 전체/정렬된 게시글 목록 조회 (파라미터 추가)
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (
    { page = 0, size = 30, sortType = 'POPULAR' }: { page?: number; size?: number; sortType?: 'POPULAR' | 'RECENT' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`${BASE_URL}/board/all`, {
        params: { page, size, sortType },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 목록 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 게시글 검색 기능 추가
export const searchBoards = createAsyncThunk(
  'board/searchBoards',
  async ({ searchKeyword, sortType = 'POPULAR' }: { searchKeyword: string; sortType?: 'POPULAR' | 'RECENT' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/board/search`, {
        params: { searchKeyword, sortType },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 검색 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 게시글 상세 조회
export const fetchBoardDetail = createAsyncThunk(
  'board/fetchBoardDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/board/${id}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 상세 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 게시글 작성
export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (newPost: { title: string; content: string; theme: string; region: string; thumbnailPublicUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/board/create', newPost);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 작성 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 게시글 수정
export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async (updatedPost: { id: number; title: string; content: string; theme: string; region: string; thumbnailPublicUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/board/update', updatedPost);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 수정 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 게시글 삭제
export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/board/delete/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 삭제 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 댓글 조회 기능 추가
export const fetchComments = createAsyncThunk(
    'board/fetchComments',
    async (boardId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/comment/${boardId}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '댓글 조회 실패');
            return rejectWithValue('알 수 없는 오류가 발생했습니다.');
        }
    }
);

// 댓글 작성 
export const createComment = createAsyncThunk(
  'board/createComment',
  async (commentData: { commentContent: string; boardId: number; parentCommentId?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/comment', commentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '댓글 작성 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 댓글 수정 
export const updateComment = createAsyncThunk(
  'board/updateComment',
  async (commentData: { id: number; commentContent: string; boardId: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comment/${commentData.id}`, { commentContent: commentData.commentContent, boardId: commentData.boardId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '댓글 수정 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

// 댓글 삭제 
export const deleteComment = createAsyncThunk(
  'board/deleteComment',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/comment/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '댓글 삭제 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- 게시글 목록 조회 ---
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 게시글 검색 ---
      .addCase(searchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(searchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 게시글 상세 조회 ---
      .addCase(fetchBoardDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(fetchBoardDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 댓글 조회 ---
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 게시글 생성 ---
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state) => {
        state.loading = false;
        // 목록에 바로 추가하는 대신, 목록을 새로고침(refetch)하는 것을 권장합니다.
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 게시글 수정 ---
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 게시글 삭제 ---
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- 댓글 생성, 수정, 삭제 (로딩 및 에러 상태만 관리) ---
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default boardSlice.reducer;