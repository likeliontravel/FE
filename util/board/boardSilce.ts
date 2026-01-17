import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { api, publicApi } from '../api';
import { RootState } from '../../store/store'; 

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
  successMessage: string | null;
}

const initialState: BoardState = {
  posts: [],
  post: null,
  comments: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchBoards = createAsyncThunk<Board[], { page?: number; size?: number; sortType?: 'POPULAR' | 'RECENT' }>(
  'board/fetchBoards',
  async ({ page = 0, size = 30, sortType = 'POPULAR' }, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board/all', { params: { page, size, sortType } });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 목록 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);



export const fetchMyBoards = createAsyncThunk<Board[], void, { state: RootState }>(
  'board/fetchMyBoards',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentUserIdentifier = state.auth.user?.userIdentifier;

      if (!currentUserIdentifier) {
        throw new Error('로그인 정보가 없습니다.');
      }

      const response = await publicApi.get('/board/all', { 
        params: { 
          page: 0, 
          size: 1000,
          sortType: 'RECENT' 
        } 
      });
      
      const allPosts: Board[] = response.data.data;

      const myPosts = allPosts.filter(post => post.writerIdentifier === currentUserIdentifier);

      return myPosts;

    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '내 게시글 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);


export const searchBoards = createAsyncThunk<Board[], { searchKeyword: string; sortType?: 'POPULAR' | 'RECENT' }>(
  'board/searchBoards',
  async ({ searchKeyword, sortType = 'POPULAR' }, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board/search', { params: { searchKeyword, sortType } });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 검색 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const fetchBoardsByTheme = createAsyncThunk<Board[], { theme: string; sortType?: 'POPULAR' | 'RECENT' }>(
  'board/fetchBoardsByTheme',
  async ({ theme, sortType = 'POPULAR' }, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board/byTheme', { params: { theme, sortType } });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '테마별 게시글 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const fetchBoardsByRegion = createAsyncThunk<Board[], { region: string; sortType?: 'POPULAR' | 'RECENT' }>(
  'board/fetchBoardsByRegion',
  async ({ region, sortType = 'POPULAR' }, { rejectWithValue }) => {
    try {
      const response = await publicApi.get('/board/byRegion', { params: { region, sortType } });
      return response.data.data;
    } catch (error)
    {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '지역별 게시글 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const fetchBoardDetail = createAsyncThunk<Board, number>(
  'board/fetchBoardDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await publicApi.get(`/board/${id}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 상세 조회 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const fetchComments = createAsyncThunk<Comment[], number>(
    'board/fetchComments',
    async (boardId, { rejectWithValue }) => {
        try {
            const response = await publicApi.get(`/comment/${boardId}`);
            return response.data.data || [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return []; 
                }
                return rejectWithValue(error.response?.data?.message || '댓글 조회 실패');
            }
            return rejectWithValue('알 수 없는 오류가 발생했습니다.');
        }
    }
);

export const uploadImage = createAsyncThunk<string, File>(
  'board/uploadImage',
  async (imageFile, { rejectWithValue }) => {
    return new Promise<string>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result); // 변환된 긴 문자열 반환
          } else {
            reject('이미지 변환 실패');
          }
        };
        reader.onerror = (error) => reject(error);
      } catch (error) {
        return rejectWithValue('이미지 처리 중 오류가 발생했습니다.');
      }
    });
  }
);

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

export const updateBoard = createAsyncThunk<Board, { id: number; title: string; content: string; theme: string; region: string; thumbnailPublicUrl?: string }>(
  'board/updateBoard',
  async (updatedPost, { rejectWithValue }) => {
    try {
      const response = await api.put('/board/update', updatedPost);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 수정 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const deleteBoard = createAsyncThunk<number, number>(
  'board/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/board/delete/${id}`);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '게시글 삭제 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

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

export const updateComment = createAsyncThunk(
  'board/updateComment',
  async (commentData: { id: number; commentContent: string; boardId: number }, { rejectWithValue }) => {
    try {
      const { id, commentContent, boardId } = commentData;
      const response = await api.put(`/comment/${id}`, { commentContent, boardId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) return rejectWithValue(error.response?.data?.message || '댓글 수정 실패');
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

export const deleteComment = createAsyncThunk<number, number>(
  'board/deleteComment',
  async (id, { rejectWithValue }) => {
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
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false; state.posts = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(searchBoards.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(searchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false; state.posts = action.payload;
      })
      .addCase(searchBoards.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(fetchBoardsByTheme.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchBoardsByTheme.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false; state.posts = action.payload;
      })
      .addCase(fetchBoardsByTheme.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(fetchBoardsByRegion.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchBoardsByRegion.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false; state.posts = action.payload;
      })
      .addCase(fetchBoardsByRegion.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(fetchBoardDetail.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false; state.post = action.payload;
      })
      .addCase(fetchBoardDetail.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(createBoard.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(createBoard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(updateBoard.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false; state.post = action.payload;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
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
      .addCase(createComment.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(updateComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchMyBoards.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchMyBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false; state.posts = action.payload;
      })
      .addCase(fetchMyBoards.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default boardSlice.reducer;