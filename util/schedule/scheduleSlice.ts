import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import dayjs from "dayjs";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  schedule?: string;
  category?: "restaurant" | "hotel" | "tourist_spot";
  img?: string;
  address?: string;
}

export interface ScheduleOption {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  startSchedule?: string;
  endSchedule?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  address: string;
  img: string;
  category: "restaurant" | "hotel" | "tourist_spot";
  [key: string]: any;
}

interface ScheduleState {
  events: CalendarEvent[];
  mainViewDate: string;
  selectedSlots: string[];
  selectedCalendarSchedule: ScheduleOption;
  selectedListSchedule: ScheduleOption;
  currentScheduleId: number | null;
  scheduleItems: ScheduleItem[];
  scheduleList: ScheduleOption[];
  startSchedule: string | null;
  endSchedule: string | null;
  loading: boolean;
  error: string | null;
}

export interface CreateSchedulePayload {
  groupName: string;
  startSchedule: string;
  endSchedule: string;
}

export interface ScheduleDetailBody {
  contentId: string;
  placeType: string;
  visitStart: string;
  visitEnd: string;
  dayOrder: number;
  orderInDay: number;
}

export interface SaveScheduleDetailArgs {
  scheduleId: number;
  body: ScheduleDetailBody[];
}

export interface UpdateScheduleDetailArgs {
  scheduleId: number;
  body: ScheduleDetailBody[];
}

interface FetchScheduleItemsArgs {
  category: string;
  location?: string;
  theme?: string;
  keyword?: string;
  page: number;
}

export interface SchedulePlace {
  id: number;
  contentId: string;
  title: string;
  img: string;
  address: string;
  placeType: string;
  visitStart: string;
  visitEnd: string;
  dayOrder: number;
  orderInDay: number;
}

export interface ScheduleDetailResponse {
  scheduleId: number;
  startSchedule: string;
  endSchedule: string;
  groupName: string;
  schedulePlaces: SchedulePlace[];
}

const initialState: ScheduleState = {
  events: [],
  mainViewDate: new Date().toISOString(),
  selectedSlots: [],
  selectedCalendarSchedule: {
    value: "default",
    label: "-",
    prefix: "내일정",
    suffix: "D-",
  },
  selectedListSchedule: { value: "restaurant", label: "맛집" },
  currentScheduleId: null,
  scheduleItems: [],
  scheduleList: [
    { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
  ],
  startSchedule: null,
  endSchedule: null,
  loading: false,
  error: null,
};

export const fetchScheduleDetails = createAsyncThunk<
  ScheduleDetailResponse,
  string
>(
  "group/fetchScheduleDetails",
  async (groupName: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/schedule/get/${groupName}`);

      if (!res.data.success) {
        return rejectWithValue("일정 조회 실패");
      }

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "일정 조회 오류");
    }
  },
);

// 드롭다운용 일정 목록
export const fetchScheduleList = createAsyncThunk<ScheduleOption[], void>(
  "schedule/fetchScheduleList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/schedule/getList");

      if (!res.data.success || !res.data.data) {
        return rejectWithValue(res.data.message || "일정 목록 조회 실패");
      }

      const validSchedules = res.data.data.filter(
        (item: any) => item.startSchedule != null,
      );

      return validSchedules.map((item: any) => {
        const today = dayjs().startOf("day");
        const targetDate = dayjs(item.startSchedule).startOf("day");
        const diffDays = targetDate.diff(today, "day");

        let dDayString =
          diffDays === 0
            ? "D-Day"
            : diffDays > 0
              ? `D-${diffDays}`
              : `D+${Math.abs(diffDays)}`;

        return {
          value: item.groupName,
          label: `${item.scheduleFirstRegion} 여행`,
          prefix: item.groupName,
          suffix: dDayString,
          startSchedule: item.startSchedule,
          endSchedule: item.endSchedule,
        };
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "일정 목록 불러오기 실패",
      );
    }
  },
);

const getEndpoint = (category: string) => {
  const map: Record<string, string> = {
    restaurant: "restaurants",
    hotel: "accommodations",
    tourist_spot: "touristspots",
  };
  return map[category] || "touristspots";
};

// 일정 관련 아이템
export const fetchScheduleItems = createAsyncThunk<
  { items: ScheduleItem[]; page: number },
  FetchScheduleItemsArgs
>("schedule/fetchScheduleItems", async (args, { rejectWithValue }) => {
  try {
    const { category, location, theme, keyword, page } = args;
    const endpoint = getEndpoint(category);

    const params = new URLSearchParams();
    if (location) params.append("regions", location);
    if (theme && category === "tourist_spot") params.append("themes", theme);
    if (keyword?.trim()) params.append("keyword", keyword.trim());

    params.append("page", page.toString());
    params.append("size", "30");
    params.append("sortType", "TITLE_ASC");

    const res = await api.get(`/places/${endpoint}`, { params });

    if (!res.data.success)
      return rejectWithValue(res.data.message || "데이터 조회 실패");

    const items = res.data.data.content.map((item: any) => ({
      ...item,
      id: item.contentId,
      address: item.address || item.addr,
      img: item.imageUrl || item.thumbnailImageUrl,
      category: category,
    }));

    return { items: items as ScheduleItem[], page };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "요청 중 오류 발생",
    );
  }
});

// 일정 생성
export const createSchedule = createAsyncThunk(
  "schedule/createSchedule",
  async (payload: CreateSchedulePayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/schedule", payload);
      if (!res.data.success)
        return rejectWithValue(res.data.message || "일정 생성 실패");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "일정 생성 중 오류 발생",
      );
    }
  },
);

// 세부 일정 저장
export const createScheduleDetail = createAsyncThunk(
  "schedule/createScheduleDetail",
  async ({ scheduleId, body }: SaveScheduleDetailArgs, { rejectWithValue }) => {
    try {
      const res = await api.post(`/schedule/detail/${scheduleId}`, body);
      if (!res.data.success)
        return rejectWithValue(res.data.message || "세부 일정 저장 실패");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "세부 일정 저장 중 오류 발생",
      );
    }
  },
);

// 세부 일정 수정
export const updateScheduleDetail = createAsyncThunk(
  "schedule/updateScheduleDetail",
  async (
    { scheduleId, body }: UpdateScheduleDetailArgs,
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`/schedule/${scheduleId}`, body);
      if (!res.data.success)
        return rejectWithValue(res.data.message || "세부 일정 수정 실패");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "세부 일정 수정 중 오류 발생",
      );
    }
  },
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addEvent(state, action: PayloadAction<CalendarEvent>) {
      state.events = state.events.filter(
        (event) => event.start !== action.payload.start,
      );
      state.events.push(action.payload);
    },
    setEvents(state, action: PayloadAction<CalendarEvent[]>) {
      state.events = action.payload;
    },
    setMainViewDate(state, action: PayloadAction<any>) {
      state.mainViewDate = action.payload;
    },
    addSelectedSlot(state, action: PayloadAction<string>) {
      if (!state.selectedSlots.includes(action.payload)) {
        state.selectedSlots.push(action.payload);
      }
    },
    removeSelectedSlot(state, action: PayloadAction<string>) {
      state.selectedSlots = state.selectedSlots.filter(
        (s) => s !== action.payload,
      );
    },
    clearSelectedSlots(state) {
      state.selectedSlots = [];
    },
    setSelectedCalendarSchedule(state, action: PayloadAction<ScheduleOption>) {
      state.selectedCalendarSchedule = action.payload;
    },
    setSelectedListSchedule(state, action: PayloadAction<ScheduleOption>) {
      state.selectedListSchedule = action.payload;
    },
    clearScheduleItems: (state) => {
      state.scheduleItems = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchScheduleDetails
      .addCase(
        fetchScheduleDetails.fulfilled,
        (state, action: PayloadAction<ScheduleDetailResponse>) => {
          const data = action.payload;

          state.events = data.schedulePlaces.map((place) => {
            let cat = place.placeType?.toLowerCase();

            return {
              id: place.contentId,
              title: place.title,
              start: place.visitStart,
              end: place.visitEnd,
              schedule: data.groupName,
              category: cat as "restaurant" | "hotel" | "tourist_spot",
              img: place.img,
              address: place.address,
            };
          });

          state.currentScheduleId = data.scheduleId;
        },
      )
      .addCase(fetchScheduleDetails.rejected, (state, action) => {
        console.error("일정 조회 실패:", action.payload);
        state.events = [];
        state.currentScheduleId = null;
      })

      // fetchScheduleList
      .addCase(fetchScheduleList.fulfilled, (state, action) => {
        state.scheduleList = [
          { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
          ...action.payload,
        ];
      })
      .addCase(fetchScheduleList.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // fetchScheduleItems
      .addCase(fetchScheduleItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleItems.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.scheduleItems = action.payload.items;
        } else {
          state.scheduleItems = [
            ...state.scheduleItems,
            ...action.payload.items,
          ];
        }
      })
      .addCase(fetchScheduleItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // createSchedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // createScheduleDetail
      .addCase(createScheduleDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScheduleDetail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createScheduleDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addEvent,
  setEvents,
  setMainViewDate,
  addSelectedSlot,
  removeSelectedSlot,
  clearSelectedSlots,
  setSelectedCalendarSchedule,
  setSelectedListSchedule,
  clearScheduleItems,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
