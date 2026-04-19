"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { api, publicApi } from "../api";

// --- 인터페이스 정의 ---
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

// --- 비동기 Thunk 함수들 (백엔드 수정 API 반영) ---

// 1. 이메일 인증 코드 발송
export const requestEmailCode = createAsyncThunk<APIResponse, { email: string }>(
  "auth/requestEmailCode",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/mail/send", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "코드 요청 실패");
    }
  }
);

// 2. 이메일 인증 코드 검증
export const verifyEmailCode = createAsyncThunk<APIResponse, { email: string; code: string }>(
  "auth/verifyEmailCode",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/mail/verify", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "인증 실패");
    }
  }
);

// 3. 회원가입 (변경: /auth/join)
export const signUpUser = createAsyncThunk<APIResponse, any>(
  "auth/signUpUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/auth/join", userData, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "회원가입 실패");
    }
  }
);

// 4. 로그인 (변경: /auth/login)
export const loginUser = createAsyncThunk<User, { email: string; password: string }>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse<User>>("/auth/login", credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "로그인 데이터 오류");
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "로그인 실패");
    }
  }
);

// 5. 로그아웃 (변경: /auth/logout)
export const logoutUser = createAsyncThunk<APIResponse>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>("/auth/logout", {}, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "로그아웃 실패");
    }
  }
);

// 6. 비밀번호 초기화 요청 (새로 추가: /auth/password/reset/request)
export const requestPasswordReset = createAsyncThunk<APIResponse, { email: string }>(
  "auth/requestPasswordReset",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/auth/password/reset/request", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "요청 실패");
    }
  }
);

// 7. 비밀번호 초기화 실행 (새로 추가: /auth/password/reset)
export const resetPassword = createAsyncThunk<APIResponse, { email: string; code: string; newPw: string }>(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>("/auth/password/reset", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "재설정 실패");
    }
  }
);

// 8. 내 프로필 조회 (변경: /members/me)
export const fetchUserProfile = createAsyncThunk<User>(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<APIResponse<User>>("/members/me");
      if (!response.data.data) throw new Error("프로필 정보 없음");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "조회 실패");
    }
  }
);

// 9. 이름 수정 (변경: /members/me/name)
export const updateName = createAsyncThunk<User, { name: string }>(
  "auth/updateName",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.patch<APIResponse<User>>("/members/me/name", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "이름 수정 실패");
    }
  }
);

// 10. 비밀번호 변경 (로그인 상태) (새로 추가: /members/me/password)
export const updatePassword = createAsyncThunk<APIResponse, { oldPw: string; newPw: string }>(
  "auth/updatePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put<APIResponse>("/members/me/password", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "비밀번호 변경 실패");
    }
  }
);

// 11. 프로필 이미지 등록/수정 (변경: /members/me/profileImage)
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
      return rejectWithValue(error.response?.data?.message || "이미지 업로드 실패");
    }
  }
);

// 12. 프로필 이미지 삭제 (새로 추가: /members/me/profileImage)
export const deleteProfileImage = createAsyncThunk<APIResponse>(
  "auth/deleteProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete<APIResponse>("/members/me/profileImage");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "이미지 삭제 실패");
    }
  }
);

// 13. 회원 탈퇴 (새로 추가: /members/me)
export const withdrawUser = createAsyncThunk<APIResponse>(
  "auth/withdrawUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete<APIResponse>("/members/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "회원 탈퇴 실패");
    }
  }
);

// --- Auth Slice 생성 ---
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
      // 로그인 성공
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "로그인에 성공했습니다.";
      })
      // 로그아웃 성공
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      // 회원가입 성공
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<APIResponse>) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      // 프로필 조회 성공
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      // 이름 수정 성공
      .addCase(updateName.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        if (state.user) state.user.name = action.payload.name;
      })
      // 이미지 업로드 성공
      .addCase(uploadProfileImage.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.user) state.user.profileImageUrl = action.payload;
      })
      // 이미지 삭제 성공
      .addCase(deleteProfileImage.fulfilled, (state) => {
        state.loading = false;
        if (state.user) state.user.profileImageUrl = null;
      })
      // 이메일 인증 성공
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.successMessage = "이메일 인증이 완료되었습니다.";
      })
      // 탈퇴 성공
      .addCase(withdrawUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      // 공통 상태 처리 (로딩 중)
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      // 공통 상태 처리 (실패)
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          const payload = action.payload;
          state.error = typeof payload === "string" ? payload : "오류가 발생했습니다.";
        }
      );
  },
});

export const { setSignUpData, resetSignUpData, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;