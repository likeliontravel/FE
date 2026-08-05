"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
  shouldChangePassword?: boolean;
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

export const requestEmailCode = createAsyncThunk<
  APIResponse,
  { email: string }
>("auth/requestEmailCode", async (payload, { rejectWithValue }) => {
  try {
    const response = await publicApi.post<APIResponse>("/mail/send", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "코드 요청 실패");
  }
});

export const verifyEmailCode = createAsyncThunk<
  APIResponse,
  { email: string; code: string }
>("auth/verifyEmailCode", async (payload, { rejectWithValue }) => {
  try {
    const response = await publicApi.post<APIResponse>(
      "/mail/verify",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "인증 실패");
  }
});

export const signUpUser = createAsyncThunk<APIResponse, any>(
  "auth/signUpUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await publicApi.post<APIResponse>(
        "/auth/join",
        userData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "회원가입 실패");
    }
  },
);

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await publicApi.post<APIResponse<User>>(
      "/auth/login",
      credentials,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "로그인 데이터 오류");
    }
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "로그인 실패",
    );
  }
});

export const logoutUser = createAsyncThunk<APIResponse>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<APIResponse>(
        "/auth/logout",
        {},
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "로그아웃 실패");
    }
  },
);

export const requestPasswordReset = createAsyncThunk<
  APIResponse,
  { email: string }
>("auth/requestPasswordReset", async (payload, { rejectWithValue }) => {
  try {
    const response = await publicApi.post<APIResponse>(
      "/auth/password/reset/request",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "요청 실패");
  }
});

export const resetPassword = createAsyncThunk<
  APIResponse,
  { email: string; code: string; newPw: string }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await publicApi.post<APIResponse>(
      "/auth/password/reset",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "재설정 실패");
  }
});

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
  },
);

export const updateName = createAsyncThunk<User, { name: string }>(
  "auth/updateName",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.patch<APIResponse<User>>(
        "/members/me/name",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "수정 실패");
    }
  },
);

export const updatePassword = createAsyncThunk<
  APIResponse,
  { email?: string; password: string }
>("auth/updatePassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.put<APIResponse>(
      "/members/me/password",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "비밀번호 변경 실패",
    );
  }
});

export const uploadProfileImage = createAsyncThunk<string, File>(
  "auth/uploadProfileImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<APIResponse<string>>(
        "/members/me/profileImage",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "업로드 실패");
    }
  },
);

export const deleteProfileImage = createAsyncThunk<APIResponse>(
  "auth/deleteProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete<APIResponse>(
        "/members/me/profileImage",
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "이미지 삭제 실패",
      );
    }
  },
);

export const withdrawUser = createAsyncThunk<APIResponse>(
  "auth/withdrawUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete<APIResponse>("/members/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "회원 탈퇴 실패");
    }
  },
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
    fetchUserName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.name = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.successMessage = "로그인 성공";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(
        signUpUser.fulfilled,
        (state, action: PayloadAction<APIResponse>) => {
          state.successMessage = action.payload.message;
        },
      )
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload;
        },
      )
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.successMessage = "인증 성공";
      })
      .addCase(updateName.fulfilled, (state, action: PayloadAction<User>) => {
        if (state.user) state.user.name = action.payload.name;
      })
      .addCase(
        uploadProfileImage.fulfilled,
        (state, action: PayloadAction<string>) => {
          if (state.user) state.user.profileImageUrl = action.payload;
        },
      )
      // 🔥 격리 조치: 오직 "auth/"로 시작하는 액션들만 로딩 및 상태를 제어하도록 제한
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          const payload = action.payload;
          state.error =
            typeof payload === "string" ? payload : "오류가 발생했습니다.";
        },
      );
  },
});

export const {
  fetchUserName,
  setSignUpData,
  resetSignUpData,
  clearAuthError,
  setUser,
} = authSlice.actions;
export default authSlice.reducer;
