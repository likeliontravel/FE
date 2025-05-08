import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://api.toleave.shop';

// Axios 인스턴스 설정
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 쿠키 기반 인증 활성화
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 사용자 데이터 타입 정의
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
}

interface APIResponse<T = unknown> {
  message: string;
  data?: T;
}

// 초기 상태
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  signUpData: {
    name: '',
    email: '',
    password: '',
    termsAccepted: [false, false, false],
    selectedPlan: null,
  },
};

// 회원가입 비동기 액션
export const signUpUser = createAsyncThunk<APIResponse, SignUpData>(
  'auth/signUpUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<APIResponse>(
        `${BASE_URL}/general-user/SignUp`,
        userData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '회원가입 실패'
        );
      }
      return rejectWithValue('회원가입 실패');
    }
  }
);

// 마이페이지 비동기 액션
export const fetchUserProfile = createAsyncThunk<APIResponse<User>>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<APIResponse<User>>(
        `${BASE_URL}/general-user/profile`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '프로필 불러오기 실패'
        );
      }
      return rejectWithValue('프로필 불러오기 실패');
    }
  }
);

// 회원 탈퇴 비동기 액션
export const deleteUser = createAsyncThunk<APIResponse, { email: string }>(
  'auth/deleteUser',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.delete<APIResponse>(
        `${BASE_URL}/user/${email}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '회원 탈퇴 실패'
        );
      }
      return rejectWithValue('회원 탈퇴 실패');
    }
  }
);

// 로그아웃 비동기 액션 (AccessToken 제거)
export const logoutUser = createAsyncThunk<APIResponse>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.Authorization; // Axios 헤더에서 제거
      return { message: '로그아웃 성공' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || '로그아웃 실패'
        );
      }
      return rejectWithValue('로그아웃 실패');
    }
  }
);

//회원 정보 수정 비동기 액션
export const updateUser = createAsyncThunk<
  APIResponse,
  Partial<{ email: string; password?: string; name?: string }>
>('auth/updateUser', async (updateData, { rejectWithValue }) => {
  try {
    const response = await axios.put<APIResponse>(
      `${BASE_URL}/user/update`,
      updateData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || '회원 정보 수정 실패'
      );
    }
    return rejectWithValue('회원 정보 수정 실패');
  }
});

//구독 동의 여부 변경 비동기 액션
export const updateSubscription = createAsyncThunk<
  APIResponse,
  { email: string; subscribe: boolean }
>('auth/updateSubscription', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<APIResponse>(
      `${BASE_URL}/user/subscription`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || '구독 정보 변경 실패'
      );
    }
    return rejectWithValue('구독 정보 변경 실패');
  }
});

// 이메일 인증 코드 요청
export const requestEmailCode = createAsyncThunk<
  APIResponse,
  { email: string }
>('auth/requestEmailCode', async ({ email }, { rejectWithValue }) => {
  try {
    const response = await axios.post<APIResponse>(`${BASE_URL}/mail/send`, {
      email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || '이메일 코드 요청 실패'
      );
    }
    return rejectWithValue('이메일 코드 요청 실패');
  }
});

// 이메일 인증 코드 검증
export const verifyEmailCode = createAsyncThunk<
  APIResponse,
  { email: string; code: string }
>('auth/verifyEmailCode', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<APIResponse>(
      `${BASE_URL}/mail/verify`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || '이메일 인증 실패'
      );
    }
    return rejectWithValue('이메일 인증 실패');
  }
});

// Axios 요청 인터셉터 - accessToken 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token not available');
        }

        const refreshResponse = await axios.post<
          APIResponse<{ accessToken: string }>
        >(`${BASE_URL}/refresh-token`, { refreshToken });

        const newAccessToken = refreshResponse.data.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 로그인 비동기 액션 (AccessToken + RefreshToken 저장)
export const loginUser = createAsyncThunk<
  APIResponse<{ accessToken: string; refreshToken: string; user: User }>,
  { email: string; password: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<
      APIResponse<{ accessToken: string; refreshToken: string; user: User }>
    >('/login', credentials);

    // accessToken, refreshToken 저장 및 헤더 설정
    const { accessToken, refreshToken } = response.data.data || {};

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || '로그인 실패');
    }
    return rejectWithValue('로그인 실패');
  }
});

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        signUpUser.fulfilled,
        (state, action: PayloadAction<APIResponse>) => {
          state.loading = false;
          state.successMessage = action.payload.message;
        }
      )
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<APIResponse<User>>) => {
          state.loading = false;
          state.user = action.payload.data || null;
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSignUpData, resetSignUpData } = authSlice.actions;

export default authSlice.reducer;
