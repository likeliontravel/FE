// store/calendarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  schedule?: string; // “내 일정” ID (e.g. trip_sokcho)
  category?: 'restaurant' | 'hotel' | 'tourist_spot'; // 리스트 카테고리
}

export interface ScheduleOption {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface CalendarState {
  events: CalendarEvent[];
  mainViewDate: Date;
  selectedSlots: Date[];
  selectedCalendarSchedule: ScheduleOption; // 상단 “내 일정”
  selectedListSchedule: ScheduleOption; // 하단 “맛집/숙소/관광지”
}

const initialState: CalendarState = {
  events: [],
  mainViewDate: new Date(),
  selectedSlots: [],
  selectedCalendarSchedule: {
    value: 'default',
    label: '-',
    prefix: '내일정',
    suffix: 'D-',
  },
  selectedListSchedule: {
    value: 'restaurant',
    label: '맛집',
  },
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addEvent(state, action: PayloadAction<CalendarEvent>) {
      state.events.push(action.payload);
    },
    setEvents(state, action: PayloadAction<CalendarEvent[]>) {
      state.events = action.payload;
    },
    setMainViewDate(state, action: PayloadAction<Date>) {
      state.mainViewDate = action.payload;
    },
    addSelectedSlot(state, action: PayloadAction<Date>) {
      if (
        !state.selectedSlots.some(
          (s) => s.getTime() === action.payload.getTime()
        )
      ) {
        state.selectedSlots.push(action.payload);
      }
    },
    removeSelectedSlot(state, action: PayloadAction<Date>) {
      state.selectedSlots = state.selectedSlots.filter(
        (s) => s.getTime() !== action.payload.getTime()
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
