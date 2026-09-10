import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";

export interface MyPageUser {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: string;
  policyAgreed: boolean;
  subscribed: boolean;
  oauthProvider: string;
  shouldChangePassword: boolean;
}

interface MyPageState {
  userInfo: MyPageUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: MyPageState = {
  userInfo: null,
  loading: false,
  error: null,
};

export const fetchMyPageInfo = createAsyncThunk<MyPageUser>(
  "mypage/fetchMyPageInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/members/me");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "마이페이지 정보 조회 실패",
        );
      }
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || "서버 통신 오류");
      }
      return rejectWithValue("알 수 없는 오류가 발생했습니다.");
    }
  },
);

export const updateUserName = createAsyncThunk<string, string>(
  "mypage/updateUserName",
  async (name, { rejectWithValue }) => {
    try {
      const response = await api.patch("/members/me/name", { name });

      if (response.data.success) {
        return name;
      } else {
        return rejectWithValue(response.data.message || "이름 변경 실패");
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "이름 변경 중 서버 오류 발생",
      );
    }
  },
);

export const updateProfileImage = createAsyncThunk<string, File>(
  "mypage/updateProfileImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/members/me/profileImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "프로필 사진 변경 실패",
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "프로필 사진 변경 중 서버 오류 발생",
      );
    }
  },
);

export const deleteProfileImage = createAsyncThunk<void, void>(
  "mypage/deleteProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/members/me/profileImage");

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "프로필 사진 삭제 실패",
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "프로필 삭제 중 서버 오류 발생",
      );
    }
  },
);

export const withdrawUser = createAsyncThunk<void, void>(
  "mypage/withdrawUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/members/me");

      if (response.data.success !== false) {
        return;
      } else {
        return rejectWithValue(response.data.message || "회원 탈퇴 실패");
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "회원 탈퇴 중 서버 오류 발생",
      );
    }
  },
);

const mypageSlice = createSlice({
  name: "mypage",
  initialState,
  reducers: {
    clearMyPageError: (state) => {
      state.error = null;
    },
    clearMyPageInfo: (state) => {
      state.userInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPageInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyPageInfo.fulfilled,
        (state, action: PayloadAction<MyPageUser>) => {
          state.loading = false;
          state.userInfo = action.payload;
        },
      )
      .addCase(fetchMyPageInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        updateUserName.fulfilled,
        (state, action: PayloadAction<string>) => {
          if (state.userInfo) {
            state.userInfo.name = action.payload;
          }
        },
      )
      .addCase(
        updateProfileImage.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (state.userInfo) {
            const newUrl =
              typeof action.payload === "string"
                ? action.payload
                : action.payload?.profileImageUrl;
            state.userInfo.profileImageUrl = newUrl;
          }
        },
      )
      .addCase(deleteProfileImage.fulfilled, (state) => {
        if (state.userInfo) {
          state.userInfo.profileImageUrl = null;
        }
      })
      .addCase(withdrawUser.fulfilled, (state) => {
        state.userInfo = null;
      });
  },
});

export const { clearMyPageError, clearMyPageInfo } = mypageSlice.actions;
export default mypageSlice.reducer;
