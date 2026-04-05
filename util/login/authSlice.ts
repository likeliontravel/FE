"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { api, publicApi } from "../api";

interface User {
  id: number | null;
  email: string;
  name: string;
  userIdentifier: string;
  policy: boolean;
  subscribe: boolean;
  role: string;
  profileImageUrl: string | null;
  provider?: string;
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

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  isEmailVerified: false,
  signUpData: {
    name: "",
    email: "",
    password: "",
    termsAccepted: [false, false, false],
    selectedPlan: null,
  },
};

export const requestEmailCode = createAsyncThunk<APIResponse, { email: string }>(
  "auth/requestEmailCode",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>(`/mail/send`, { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "코드 요청 실패");
    }
  }
);

export const verifyEmailCode = createAsyncThunk<APIResponse, { email: string; code: string }>(
  "auth/verifyEmailCode",
  async (data, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>(`/mail/verify`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "인증 실패");
    }
  }
);

export const signUpUser = createAsyncThunk<APIResponse, Omit<SignUpData, "termsAccepted" | "selectedPlan">>(
  "auth/signUpUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>(`/auth/join`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "회원가입 실패");
    }
  }
);

export const loginUser = createAsyncThunk<User, { email: string; password: string }>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse<User>>(`/auth/login`, credentials, { withCredentials: true });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "로그인 데이터 오류");
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "로그인 실패");
    }
  }
);

export const logoutUser = createAsyncThunk<APIResponse>("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<APIResponse>("/auth/logout");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "로그아웃 실패");
  }
});

export const fetchUserProfile = createAsyncThunk<User>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<APIResponse<User>>("/members/me");
    if (!response.data.data) throw new Error("프로필 정보 없음");
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "조회 실패");
  }
});

export const requestPasswordReset = createAsyncThunk<APIResponse, { email: string }>(
  "auth/requestPasswordReset",
  async (data, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/auth/password/reset/request", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "요청 실패");
    }
  }
);

export const resetPassword = createAsyncThunk<APIResponse, { email: string; code: string; newPw: string }>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/auth/password/reset", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "재설정 실패");
    }
  }
);

export const updateName = createAsyncThunk<User, { name: string }>(
  "auth/updateName",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.patch<APIResponse<User>>("/members/me/name", data);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "수정 실패");
    }
  }
);

export const uploadProfileImage = createAsyncThunk<string, File>(
  "auth/uploadProfileImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<APIResponse<string>>("/members/me/profileImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "업로드 실패");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
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
      // 1. addCase를 먼저 작성하여 정확한 타입을 추론하게 함
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "로그인 성공";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.successMessage = "인증 성공";
      })
      .addCase(updateName.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        if (state.user) state.user.name = action.payload.name;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.user) state.user.profileImageUrl = action.payload;
      })
      // 2. addMatcher는 Case들 뒤에 배치하여 중복 로직 처리
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
.addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          const payload = (action as PayloadAction<string>).payload;
          state.error = typeof payload === 'string' ? payload : "오류가 발생했습니다.";
        }
      );
  },
});

export const { setSignUpData, resetSignUpData, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;