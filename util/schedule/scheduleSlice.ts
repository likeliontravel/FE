import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import dayjs from "dayjs";

// ==========================================
// 1. 타입 및 인터페이스 정의
// ==========================================
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

export interface ScheduleDetailBody {
  contentId: string;
  placeType: string;
  visitStart: string;
  visitedEnd: string;
  dayOrder: number;
  orderInDay: number;
}

export interface SaveScheduleDetailArgs {
  scheduleId: number;
  body: ScheduleDetailBody[];
}

export interface ScheduleItem {
  id: string;
  title: string;
  address: string;
  category: "restaurant" | "hotel" | "tourist_spot";
  [key: string]: any;
}

export interface CreateSchedulePayload {
  groupName: string;
  startSchedule: string;
  endSchedule: string;
}

interface FetchScheduleItemsArgs {
  category: string;
  location?: string;
  theme?: string;
  keyword?: string;
  page: number;
}

// ==========================================
// 2. 통합된 State 정의
// ==========================================
interface ScheduleState {
  // Calendar 관련 상태
  events: CalendarEvent[];
  mainViewDate: string;
  selectedSlots: Date[];
  selectedCalendarSchedule: ScheduleOption;
  selectedListSchedule: ScheduleOption;
  currentScheduleId: number | null; // 세부 일정 저장 시 사용할 숫자형 ID 보관소!

  // List 관련 상태
  scheduleItems: ScheduleItem[];
  scheduleList: ScheduleOption[];
  loading: boolean;
  error: string | null;
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
  currentScheduleId: null, // 초기값 null

  scheduleItems: [],
  scheduleList: [
    { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
  ],
  loading: false,
  error: null,
};

// ==========================================
// 3. 비동기 Thunk 함수들
// ==========================================

// [달력] 세부 일정 가져오기 (+ 실제 scheduleId 저장)
export const fetchScheduleDetails = createAsyncThunk(
  "schedule/fetchScheduleDetails",
  async (groupName: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/schedule/get/${groupName}`);

      if (!res.data.success) {
        return rejectWithValue(res.data.message || "일정 조회 실패");
      }

      const data = res.data.data;
      const scheduleId = data.scheduleId;
      const places = data.schedulePlaces || [];

      const mappedEvents = places.map((item: any) => {
        // 백엔드의 PlaceType을 프론트 카테고리로 매핑
        let cat = item.placeType?.toLowerCase();
        if (cat === "accommodation") cat = "hotel";
        if (cat === "touristspot") cat = "tourist_spot";

        return {
          id: `${item.contentId}-${item.visitStart}`,
          title: item.title,
          start: item.visitStart,
          end: item.visitedEnd,
          schedule: groupName,
          category: cat,
          img: item.img,
          address: item.address,
        };
      });

      // 이벤트 목록과 실제 숫자 ID를 같이 반환합니다.
      return { events: mappedEvents, scheduleId };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "일정 조회 에러",
      );
    }
  },
);

// [리스트] 드롭다운용 일정 목록 가져오기
export const fetchScheduleList = createAsyncThunk(
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

      const apiOptions = validSchedules.map((item: any) => {
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

      return apiOptions;
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

// [리스트] 하단 장소 아이템 목록 가져오기
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
      category: category,
    }));

    return { items: items as ScheduleItem[], page };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "요청 중 오류 발생",
    );
  }
});

// [달력] 새로운 큰 일정 껍데기 생성
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

// [달력] 세부 장소들 저장하기 (Body + PathVariable 완벽 분리)
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

// ==========================================
// 4. 통합 Slice 및 Reducers
// ==========================================
const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    // 캘린더 관련 동기 액션
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
    addSelectedSlot(state, action: PayloadAction<Date>) {
      if (
        !state.selectedSlots.some(
          (s) => s.getTime() === action.payload.getTime(),
        )
      ) {
        state.selectedSlots.push(action.payload);
      }
    },
    removeSelectedSlot(state, action: PayloadAction<Date>) {
      state.selectedSlots = state.selectedSlots.filter(
        (s) => s.getTime() !== action.payload.getTime(),
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
    // 리스트 관련 동기 액션
    clearScheduleItems: (state) => {
      state.scheduleItems = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchScheduleDetails
      .addCase(fetchScheduleDetails.fulfilled, (state, action) => {
        state.events = action.payload.events; // 가공된 캘린더용 데이터
        state.currentScheduleId = action.payload.scheduleId; // 숫자형 ID 저장!
      })
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
