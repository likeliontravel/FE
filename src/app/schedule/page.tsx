'use client';

import { useCallback, useState } from 'react';
import WeekCalendar from '../../../util/scheduleCalendar/WeekCalendar';
import ScheduleList from '../../../util/scheduleList/ScheduleList';
import dayjs from 'dayjs';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const SchedulePage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);

  const handleSlotSelect = useCallback((slotDate: Date) => {
    setSelectedSlots((prevSlots) => {
      const exists = prevSlots.some((d) => dayjs(d).isSame(slotDate));
      if (exists) {
        // 이미 선택된 슬롯이면 해제
        return prevSlots.filter((d) => !dayjs(d).isSame(slotDate));
      } else {
        // 새로 선택
        return [...prevSlots, slotDate];
      }
    });
  }, []);

  const handleScheduleItemClick = useCallback(
    (item: any) => {
      if (selectedSlots.length === 0) {
        alert('먼저 달력에서 시간을 하나 이상 선택하세요.');
        return;
      }

      // 모든 슬롯에 대해 이벤트 생성
      const newEvents = selectedSlots.map((slot) => {
        const startTime = dayjs(slot);
        const endTime = startTime.add(1, 'hour'); // 1시간 일정 가정

        return {
          id: String(Date.now()) + Math.random(), // 간단 고유 ID
          title: item.title,
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        } as CalendarEvent;
      });

      // 기존 이벤트 + 새 이벤트
      setEvents((prev) => [...prev, ...newEvents]);

      // 작업 마치면 선택된 슬롯 초기화
      setSelectedSlots([]);
    },
    [selectedSlots]
  );

  return (
    <>
      <WeekCalendar events={events} onSlotSelect={handleSlotSelect} />
      <ScheduleList onScheduleItemClick={handleScheduleItemClick} />
    </>
  );
};

export default SchedulePage;
