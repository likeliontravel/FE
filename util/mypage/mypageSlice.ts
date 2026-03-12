import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";

export interface MyPageUser {
  id: number | null;
  email: string;
  name: string;
  profileImageUrl: string | null;
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
      const response = await api.get("/user/getProfile");

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
      });
  },
});

export const { clearMyPageError, clearMyPageInfo } = mypageSlice.actions;
export default mypageSlice.reducer;
