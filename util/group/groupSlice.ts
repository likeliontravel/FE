import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Group {
  id: number;
  groupName: string;
  description?: string;
  createdTime: string;
}

export interface GroupDetail {
  groupName: string;
  description?: string | null;
  createdName: string;
  members: any[];
  latestAnnouncement?: any;
}

export interface GroupSchedule {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
}

interface GroupState {
  groups: Group[];
  groupDetail: GroupDetail | null;
  schedule: GroupSchedule[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  groupDetail: null,
  schedule: null,
  loading: false,
  error: null,
};

export const fetchUserGroups = createAsyncThunk<Group[]>(
  "group/fetchUserGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/group/user-groups");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "그룹 조회 실패"
      );
    }
  }
);

export const createGroup = createAsyncThunk(
  "group/createGroup",
  async (
    { groupName, description }: { groupName: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/group/create", {
        groupName,
        description,
      });

      if (!res.data.success) {
        return rejectWithValue(res.data.message || "그룹 생성 실패");
      }

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "그룹 생성 오류 발생"
      );
    }
  }
);

export const fetchGroupDetail = createAsyncThunk<GroupDetail, string>(
  "group/fetchGroupDetail",
  async (groupName, { rejectWithValue }) => {
    try {
      const res = await api.get(`/group/${groupName}/detail`);

      if (!res.data.success) {
        return rejectWithValue("그룹 상세 조회 실패");
      }

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "그룹 상세 조회 오류"
      );
    }
  }
);

export const fetchGroupSchedule = createAsyncThunk<GroupSchedule[], string>(
  "group/fetchGroupSchedule",
  async (groupName, { rejectWithValue }) => {
    try {
      const res = await api.get(`/schedule/get/${groupName}`);

      if (!res.data.success) {
        return rejectWithValue("일정 조회 실패");
      }

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "일정 조회 오류");
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserGroups.fulfilled,
        (state, action: PayloadAction<Group[]>) => {
          state.loading = false;
          state.groups = action.payload;
        }
      )
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchGroupDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupDetail.fulfilled,
        (state, action: PayloadAction<GroupDetail>) => {
          state.loading = false;
          state.groupDetail = action.payload;
        }
      )
      .addCase(fetchGroupDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchGroupSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupSchedule.fulfilled,
        (state, action: PayloadAction<GroupSchedule[]>) => {
          state.loading = false;
          state.schedule = action.payload;
        }
      )
      .addCase(fetchGroupSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default groupSlice.reducer;
