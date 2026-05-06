import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../util/api";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  schedule?: string;
  category?: "restaurant" | "hotel" | "tourist_spot";
}

export interface ScheduleOption {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface CalendarState {
  events: CalendarEvent[];
  mainViewDate: string;
  selectedSlots: Date[];
  selectedCalendarSchedule: ScheduleOption;
  selectedListSchedule: ScheduleOption;
}

const initialState: CalendarState = {
  events: [],
  mainViewDate: new Date().toISOString(),
  selectedSlots: [],
  selectedCalendarSchedule: {
    value: "default",
    label: "-",
    prefix: "내일정",
    suffix: "D-",
  },
  selectedListSchedule: {
    value: "restaurant",
    label: "맛집",
  },
};

export const fetchScheduleDetails = createAsyncThunk(
  "calendar/fetchScheduleDetails",
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/schedule/get/${scheduleId}`);

      if (!res.data.success) {
        return rejectWithValue(res.data.message || "일정 조회 실패");
      }

      const mappedEvents = res.data.data.map((item: any) => ({
        id: item.contentId,
        title: item.title,
        start: item.visitStart,
        end: item.visitedEnd,
        schedule: scheduleId,
        category: item.placeType.toLowerCase(),
      }));

      return mappedEvents;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "일정 조회 에러",
      );
    }
  },
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    addEvent(state, action: PayloadAction<CalendarEvent>) {
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
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchScheduleDetails.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      .addCase(fetchScheduleDetails.rejected, (state, action) => {
        console.error("일정 조회 실패:", action.payload);
        state.events = [];
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
} = calendarSlice.actions;

export default calendarSlice.reducer;
