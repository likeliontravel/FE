import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://api.toleave.shop';

// 게시글 데이터 타입 정의
interface Board {
  id: number;
  title: string;
  content: string;
  writer: string;
  boardHits: number;
  createdTime: string;
  image?: string | null;
  originalFileName?: string | null;
  storeFileName?: string | null;
  fileAttached?: number;
}

interface Comment {
  id: number;
  commentWriter: string;
  commentContent: string;
  boardId: number;
  parentCommentId?: number | null;
}

interface BoardState {
  posts: Board[];
  post: Board | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// 초기 상태
const initialState: BoardState = {
  posts: [],
  post: null,
  comments: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 게시글 목록 조회
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/board`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError일 때만 안전하게 접근
        return rejectWithValue(
          error.response?.data?.message || '게시글 조회 실패'
        );
      }
      return rejectWithValue('게시글 조회 실패');
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
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '게시글 조회 실패'
        );
      }
      return rejectWithValue('게시글 조회 실패');
    }
  }
);

// 게시글 작성
export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (
    newPost: { title: string; content: string; writer: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/board`, newPost);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '게시글 작성 실패'
        );
      }
      return rejectWithValue('게시글 작성 실패');
    }
  }
);

// 게시글 수정
export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async (
    updatedPost: { id: number; title: string; content: string; writer: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/board/${updatedPost.id}`,
        updatedPost
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '게시글 수정 실패'
        );
      }
      return rejectWithValue('게시글 수정 실패');
    }
  }
);

// 게시글 삭제
export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/board/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '게시글 삭제 실패'
        );
      }
      return rejectWithValue('게시글 삭제 실패');
    }
  }
);

// 댓글 작성
export const createComment = createAsyncThunk(
  'board/createComment',
  async (
    commentData: {
      commentWriter: string;
      commentContent: string;
      boardId: number;
      parentCommentId?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/comment`, commentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '댓글 작성 실패'
        );
      }
      return rejectWithValue('댓글 작성 실패');
    }
  }
);

// 댓글 수정
export const updateComment = createAsyncThunk(
  'board/updateComment',
  async (
    commentData: {
      id: number;
      commentWriter: string;
      commentContent: string;
      boardId: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/comment/${commentData.id}`,
        commentData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '댓글 수정 실패'
        );
      }
      return rejectWithValue('댓글 수정 실패');
    }
  }
);

// 댓글 삭제
export const deleteComment = createAsyncThunk(
  'board/deleteComment',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/comment/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '댓글 삭제 실패'
        );
      }
      return rejectWithValue('댓글 삭제 실패');
    }
  }
);

// Redux Slice 생성
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBoards.fulfilled,
        (state, action: PayloadAction<Board[]>) => {
          state.loading = false;
          state.posts = action.payload;
        }
      )
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBoardDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchBoardDetail.fulfilled,
        (state, action: PayloadAction<Board>) => {
          state.loading = false;
          state.post = action.payload;
        }
      )
      .addCase(fetchBoardDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.posts.push(action.payload);
        state.successMessage = action.payload.message;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(
        deleteBoard.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.posts = state.posts.filter(
            (post) => post.id !== action.payload
          );
          state.successMessage = '게시글 삭제 성공';
        }
      )
      .addCase(createComment.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(
        deleteComment.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.comments = state.comments.filter(
            (comment) => comment.id !== action.payload
          );
          state.successMessage = '댓글 삭제 성공';
        }
      );
  },
});

export default boardSlice.reducer;
