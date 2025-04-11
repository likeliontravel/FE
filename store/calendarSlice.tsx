import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  schedule?: string;
  category?: 'restaurant' | 'hotel' | 'tourist_spot';
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
  selectedCalendarSchedule: ScheduleOption;
  selectedListSchedule: ScheduleOption;
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

    // 캘린더 Select(“내 일정” 등)용
    setSelectedCalendarSchedule(state, action: PayloadAction<ScheduleOption>) {
      state.selectedCalendarSchedule = action.payload;
    },

    // 리스트 Select(“맛집/숙소/관광지”)용
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
