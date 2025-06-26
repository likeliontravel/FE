import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://api.toleave.shop';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Refresh token not available');

        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${BASE_URL}/refresh-token`,
          { refreshToken }
        );
        
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common.Authorization;
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
  id: string;
  email: string;
  name: string;
  isSubscribed: boolean;
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

// 이메일 중복 확인 (API 엔드포인트 확정 필요)
export const checkEmailExists = createAsyncThunk<APIResponse, { email: string }>(
    'auth/checkEmailExists',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await api.post<APIResponse>('/general-user/check-email', { email });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || '이메일 중복 확인 실패');
            }
            return rejectWithValue('이메일 중복 확인 중 알 수 없는 오류 발생');
        }
    }
);

// 이메일 인증 코드 요청
export const requestEmailCode = createAsyncThunk<APIResponse, { email: string }>(
  'auth/requestEmailCode',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>('/mail/send', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '이메일 코드 요청 실패');
      }
      return rejectWithValue('이메일 코드 요청 중 알 수 없는 오류 발생');
    }
  }
);

// 이메일 인증 코드 검증
export const verifyEmailCode = createAsyncThunk<APIResponse, { email: string; code: string }>(
  'auth/verifyEmailCode',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>('/mail/verify', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '이메일 인증 실패');
      }
      return rejectWithValue('이메일 인증 중 알 수 없는 오류 발생');
    }
  }
);


// 회원가입
export const signUpUser = createAsyncThunk<APIResponse, Omit<SignUpData, 'termsAccepted' | 'selectedPlan'>>(
  'auth/signUpUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>('/general-user/signup', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '회원가입 실패');
      }
      return rejectWithValue('회원가입 중 알 수 없는 오류 발생');
    }
  }
);

// 로그인
export const loginUser = createAsyncThunk<
  { accessToken: string; refreshToken: string; user: User },
  { email: string; password: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<APIResponse<{ accessToken: string; refreshToken: string; user: User }>>('/login', credentials);
    const responseData = response.data.data;

    if (!responseData || !responseData.accessToken || !responseData.refreshToken || !responseData.user) {
        throw new Error('Invalid login response');
    }
    
    const { accessToken, refreshToken, user } = responseData;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    return { accessToken, refreshToken, user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.data.message || '로그인 실패');
    }
    return rejectWithValue('로그인 중 알 수 없는 오류 발생');
  }
});

// 로그아웃
export const logoutUser = createAsyncThunk<APIResponse>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>('/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common.Authorization;
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data.message || '로그아웃 실패');
        }
        return rejectWithValue('로그아웃 중 알 수 없는 오류 발생');
    }
  }
);

// 마이페이지 프로필 조회
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



// Redux Slice 생성
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
    }
  },
  extraReducers: (builder) => {
    builder
      // 로그인 액션 처리
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      })
      // 로그아웃 액션 처리
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      })
      // 회원가입 액션 처리
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
      // 프로필 조회 액션 처리
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
      // 이메일 인증 코드 검증
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isEmailVerified = true;
      });
  },
});

export const { setSignUpData, resetSignUpData, clearAuthError } = authSlice.actions;

export default authSlice.reducer;