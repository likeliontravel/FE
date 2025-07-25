'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { getCookie } from 'cookies-next';

const BASE_URL = 'https://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('accessToken');
      
      if (!token) {
        const cookieToken = getCookie('Authorization');
        if (typeof cookieToken === 'string') {
            token = cookieToken;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken') || getCookie('RefreshToken');
        if (!refreshToken) throw new Error('Refresh token not available');
        
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        
        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
        if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } else {
            throw new Error('New access token not received');
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 타입 정의
interface User {
  id: number;
  email: string;
  name: string;
  policy: boolean;
  subscribe: boolean;
  role: string;
  password?: string | null;
}
interface SignUpData {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean[];
  selectedPlan: string | null;
}
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  signUpData: SignUpData;
  isEmailVerified: boolean;
}
interface APIResponse<T = unknown> {
  message: string;
  data?: T;
  success: boolean;
  status: number;
}

// 초기 상태
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  isEmailVerified: false,
  signUpData: {
    name: '',
    email: '',
    password: '',
    termsAccepted: [false, false, false],
    selectedPlan: null,
  },
};

// --- 비동기 Thunks ---

export const requestEmailCode = createAsyncThunk<APIResponse, { email: string }>(
  'auth/requestEmailCode',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post<APIResponse>(`${BASE_URL}/mail/send`, { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '이메일 코드 요청 실패');
      }
      return rejectWithValue('이메일 코드 요청 중 알 수 없는 오류 발생');
    }
  }
);

export const verifyEmailCode = createAsyncThunk<APIResponse, { email: string; code: string }>(
  'auth/verifyEmailCode',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<APIResponse>(`${BASE_URL}/mail/verify`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '이메일 인증 실패');
      }
      return rejectWithValue('이메일 인증 중 알 수 없는 오류 발생');
    }
  }
);

export const signUpUser = createAsyncThunk<APIResponse, Omit<SignUpData, 'termsAccepted' | 'selectedPlan'>>(
  'auth/signUpUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<APIResponse>(`${BASE_URL}/general-user/signup`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '회원가입 실패');
      }
      return rejectWithValue('회원가입 중 알 수 없는 오류 발생');
    }
  }
);

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<APIResponse<User>>(
      `${BASE_URL}/login`, 
      credentials,
      { withCredentials: true }
    );

    const accessToken = response.headers['authorization']?.replace('Bearer ', '');
    const refreshToken = response.headers['refresh-token']?.replace('Bearer ', '');
    const user = response.data.data;

    if (!response.data.success || !user) {
      throw new Error(response.data.message || '로그인 응답 데이터가 올바르지 않습니다.');
    }
    if (!accessToken || !refreshToken) {
      throw new Error('응답 헤더에 토큰이 포함되지 않았습니다.');
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return user;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.data.message || '로그인에 실패했습니다.');
    }
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('로그인 중 알 수 없는 오류가 발생했습니다.');
  }
});

export const logoutUser = createAsyncThunk<APIResponse>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>('/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data.message || '로그아웃 실패');
        }
        return rejectWithValue('로그아웃 중 알 수 없는 오류 발생');
    }
  }
);

export const fetchUserProfile = createAsyncThunk<User>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<APIResponse<User>>('/general-user/profile');
      if (!response.data.data) throw new Error('User data not found');
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '프로필 조회 실패');
      }
      return rejectWithValue('프로필 조회 중 알 수 없는 오류 발생');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSignUpData: (state, action: PayloadAction<Partial<SignUpData>>) => {
      state.signUpData = { ...state.signUpData, ...action.payload };
    },
    resetSignUpData: (state) => {
      state.signUpData = initialState.signUpData;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = '로그인 성공!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.successMessage = '이메일 인증 성공!';
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSignUpData, resetSignUpData, clearAuthError, setUser } = authSlice.actions;

export default authSlice.reducer;