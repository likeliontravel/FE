import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  schedule?: string;
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
  selectedSchedule: ScheduleOption;
}

const initialState: CalendarState = {
  events: [],
  mainViewDate: new Date(),
  selectedSlots: [],
  selectedSchedule: {
    value: 'default',
    label: '-',
    prefix: '내일정',
    suffix: 'D-',
  },
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // 일정 추가
    addEvent(state, action: PayloadAction<CalendarEvent>) {
      state.events.push(action.payload);
    },
    // 일정 전체 업데이트
    setEvents(state, action: PayloadAction<CalendarEvent[]>) {
      state.events = action.payload;
    },
    // 메인 뷰 날짜 변경
    setMainViewDate(state, action: PayloadAction<Date>) {
      state.mainViewDate = action.payload;
    },
    // 슬롯 선택 추가 (중복 없이)
    addSelectedSlot(state, action: PayloadAction<Date>) {
      const exists = state.selectedSlots.some(
        (slot) => slot.getTime() === action.payload.getTime()
      );
      if (!exists) {
        state.selectedSlots.push(action.payload);
      }
    },
    // 선택한 슬롯 제거
    removeSelectedSlot(state, action: PayloadAction<Date>) {
      state.selectedSlots = state.selectedSlots.filter(
        (slot) => slot.getTime() !== action.payload.getTime()
      );
    },
    // 선택한 슬롯 초기화
    clearSelectedSlots(state) {
      state.selectedSlots = [];
    },

    // 드롭다운에서 선택된 일정 업데이트
    setSelectedSchedule(state, action: PayloadAction<ScheduleOption>) {
      state.selectedSchedule = action.payload;
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
  setSelectedSchedule,
} = calendarSlice.actions;

export default calendarSlice.reducer;
