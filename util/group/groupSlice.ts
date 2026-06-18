import { SchedulePlace } from "../schedule/scheduleSlice";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";

export interface Group {
  id: number;
  groupName: string;
  description?: string;
  createdByMemberId: string;
}

export interface CreateGroupPayload {
  groupName: string;
  description?: string;
}

export interface GroupDetail {
  groupName: string;
  description?: string | null;
  createdName: string;
  members: any[];
  latestAnnouncement?: any;
  schedules: GroupSchedule;
}

export interface GroupSchedule {
  startDate: string;
  endDate: string;
  places: SchedulePlace[];
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  writerName: string;
  createdTime: string;
}

export interface CreateNoticePayload {
  groupName: string;
  title: string;
  content: string;
}

interface GroupState {
  groups: Group[];
  groupDetail: GroupDetail | null;
  schedule: GroupSchedule[] | null;
  notices: Notice[];
  inviteLink: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  groupDetail: null,
  schedule: null,
  notices: [],
  inviteLink: null,
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
        error?.response?.data?.message || "그룹 조회 실패",
      );
    }
  },
);

export const createGroup = createAsyncThunk<Group, CreateGroupPayload>(
  "group/createGroup",
  async ({ groupName, description }, { rejectWithValue }) => {
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
        error?.response?.data?.message || "그룹 생성 오류 발생",
      );
    }
  },
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
        err?.response?.data?.message || "그룹 상세 조회 오류",
      );
    }
  },
);

export const fetchGroupInvitation = createAsyncThunk<string, string>(
  "group/fetchGroupInvitation",
  async (groupName, { rejectWithValue }) => {
    try {
      const res = await api.get(`/group/${groupName}/invitation`);

      if (res.data.success) {
        return res.data.data?.invitationUrl || "";
      } else {
        return rejectWithValue(res.data.message || "초대링크 조회 실패");
      }
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "초대링크 조회 에러",
      );
    }
  },
);

export const generateGroupInvitation = createAsyncThunk<string, string>(
  "group/generateGroupInvitation",
  async (groupName, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/group/${groupName}/invitation/generateNew`,
        {},
      );

      if (res.data.success) {
        return res.data.data?.invitationUrl || "";
      } else {
        return rejectWithValue(res.data.message || "초대링크 생성 실패");
      }
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "초대링크 생성 오류",
      );
    }
  },
);

export const fetchGroupNotices = createAsyncThunk<Notice[], string>(
  "group/fetchGroupNotices",
  async (groupName, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/group/announcement/getAllAnnouncement?groupName=${groupName}`,
      );
      if (res.data.success) {
        return res.data.data;
      } else {
        return rejectWithValue(res.data.message || "공지 조회 실패");
      }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "공지 조회 에러");
    }
  },
);

export const createGroupNotice = createAsyncThunk<Notice, CreateNoticePayload>(
  "group/createGroupNotice",
  async ({ groupName, title, content }, { rejectWithValue }) => {
    try {
      const res = await api.post("/group/announcement/create", {
        groupName,
        title,
        content,
      });

      if (res.data.success) {
        return res.data.data;
      } else {
        return rejectWithValue(res.data.message || "공지 생성 실패");
      }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "공지 생성 에러");
    }
  },
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    clearNotices: (state) => {
      state.notices = [];
    },
    clearInviteLink: (state) => {
      state.inviteLink = null;
    },
    clearGroupDetail: (state) => {
      state.groupDetail = null;
      state.schedule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
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
        },
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
        },
      )
      .addCase(fetchGroupDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchGroupInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupInvitation.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.inviteLink = action.payload;
        },
      )
      .addCase(fetchGroupInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(generateGroupInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        generateGroupInvitation.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          if (action.payload) {
            state.inviteLink = action.payload;
          }
        },
      )
      .addCase(generateGroupInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchGroupNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupNotices.fulfilled,
        (state, action: PayloadAction<Notice[]>) => {
          state.loading = false;
          state.notices = action.payload;
        },
      )
      .addCase(fetchGroupNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createGroupNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupNotice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGroupNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotices, clearInviteLink, clearGroupDetail, clearError } =
  groupSlice.actions;
export default groupSlice.reducer;
