'use client';

import React, { useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateClickArg } from '@fullcalendar/interaction';
import {
  DateSelectArg,
  EventClickArg,
  EventMountArg,
} from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import UseReactSelect from '../select/UseReactSelect';

import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 요일/달 표기
dayjs.locale('ko');

import styles from './WeekCalendar.module.scss';
import getMonthWeekString from './getMonthWeekString';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const WeekCalendar = () => {
  const pluginMini = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const pluginsMain = useMemo(() => [timeGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  // 일정 데이터
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: '회의',
      start: '2025-03-26T10:00:00',
      end: '2025-03-26T11:00:00',
    },
    { id: '2', title: '점심약속', start: '2025-03-27T12:00:00' },
  ]);

  const handleEventDidMount = (arg: EventMountArg) => {
    const start = arg.event.start;
    if (!start) return;

    const timeStr = dayjs(start).format('HH:mm:00');
    const dateStr = dayjs(start).format('YYYY-MM-DD');

    const slotLaneEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`
    );
    const slotLabelEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`
    );
    if (slotLaneEl && slotLabelEl) {
      slotLaneEl.classList.add('has-event');
      slotLabelEl.classList.add('has-event');
    }
  };

  const handleEventWillUnmount = (arg: EventMountArg) => {
    const start = arg.event.start;
    if (!start) return;

    const timeStr = dayjs(start).format('HH:mm:00');
    const dateStr = dayjs(start).format('YYYY-MM-DD');

    const slotLaneEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`
    );
    const slotLabelEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`
    );
    if (slotLaneEl && slotLabelEl) {
      slotLaneEl.classList.remove('has-event');
      slotLabelEl.classList.remove('has-event');
    }
  };

  const [mainViewDate, setMainViewDate] = useState(new Date());

  const handleMiniDateClick = useCallback((arg: DateSelectArg) => {
    setMainViewDate(arg.start);
  }, []);

  // 메인 스케줄 이벤트 클릭
  const handleMainEventClick = (arg: EventClickArg) => {
    alert(`이벤트 클릭: ${arg.event.title}`);
  };

  // 메인 스케줄 빈 영역 클릭 → 새 일정 추가
  const handleMainSelect = (arg: DateClickArg) => {
    const startTime = dayjs(arg.date);
    const endTime = startTime.add(1, 'hour');
    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: '새 일정',
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  const hasEventOnDate = (date: Date) => {
    const dayYmd = dayjs(date).format('YYYY-MM-DD');
    return events.some((ev) => {
      const startYmd = dayjs(ev.start).format('YYYY-MM-DD');
      const endYmd = ev.end ? dayjs(ev.end).format('YYYY-MM-DD') : startYmd;
      // dayYmd가 startYmd ~ endYmd 범위 내에 있으면 true
      return dayYmd >= startYmd && dayYmd <= endYmd;
    });
  };

  // 날짜 셀마다 클래스를 부여 (이 콜백은 이벤트 변경 시마다 재실행)
  const handleDayCellClassNames = useCallback(
    (arg: any) => {
      return hasEventOnDate(arg.date) ? ['has-event'] : [];
    },
    [hasEventOnDate]
  );

  const getWeekDates = (baseDate: Date) => {
    const startOfWeek = dayjs(baseDate).startOf('week');
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  };

  const weekDates = getWeekDates(mainViewDate);

  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  const handleDayColumnClick = useCallback(
    (event: React.MouseEvent, dateStr: string) => {
      if ((event.target as HTMLElement).classList.contains(styles.dayHeader)) {
        setOpenDays((prev) => ({
          ...prev,
          [dateStr]: !prev[dateStr],
        }));
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    },
    []
  );

  const getDayColumnClickHandler = useCallback(
    (dateStr: string) => (event: React.MouseEvent) =>
      handleDayColumnClick(event, dateStr),
    [handleDayColumnClick]
  );

  const slotLabelContent = useCallback((arg: any) => {
    const hour = arg.date.getHours();
    const hourStr = String(hour).padStart(2, '0');
    return hourStr + ' -';
  }, []);

  const headerToolbarConfig = useMemo(
    () => ({
      left: 'prev',
      center: 'title',
      right: 'next',
    }),
    []
  );

  const dayCellContent = useCallback((arg: any) => {
    return arg.date.getDate().toString();
  }, []);

  const gridTemplateColumns = useMemo(() => {
    return weekDates
      .map((day) => {
        const dayStr = day.format('YYYY-MM-DD');
        return openDays[dayStr] ? '2fr' : '1fr';
      })
      .join(' ');
  }, [weekDates, openDays]);

  const dayColumnDivStyle = useMemo<React.CSSProperties>(
    () => ({ gridTemplateColumns }),
    [gridTemplateColumns]
  );

  return (
    <div className={styles.container}>
      {/* ──────────────── 메인 스케줄(요일별) ──────────────── */}
      {/* 한 주(7일) 날짜를 가로로 나열하고, 각 날짜마다 timeGridDay FullCalendar */}
      <div className={styles.mainScheduleDays}>
        <div className={styles.daySelect}>
          <p>{getMonthWeekString(mainViewDate)}</p>
          <UseReactSelect type="calendar" />
        </div>
        <div className={styles.dayColumnDiv} style={dayColumnDivStyle}>
          {weekDates.map((day) => {
            const dayStr = day.format('YYYY-MM-DD');
            const isOpen = openDays[dayStr] ?? false;

            return (
              <div
                key={dayStr}
                className={`${styles.dayColumn} ${isOpen ? styles.expanded : styles.collapsed}`}
                onClick={getDayColumnClickHandler(dayStr)}
                data-date={dayStr}
              >
                {/* 날짜 헤더 */}
                <h3 className={styles.dayHeader}>{day.format('D (ddd)')}</h3>

                {isOpen && (
                  <FullCalendar
                    // Day 단위
                    initialView="timeGridDay"
                    // 각 날짜마다 다른 initialDate
                    initialDate={dayStr}
                    dayHeaders={false} // 요일 헤더 표시 끄기
                    plugins={pluginsMain}
                    locales={localesArray}
                    locale="ko"
                    // FullCalendar 기본 헤더(툴바) 비활성화
                    headerToolbar={false}
                    slotLabelContent={slotLabelContent}
                    // 시간 범위 (05:00 ~ 자정)
                    slotMinTime="05:00:00"
                    slotMaxTime="24:00:00"
                    // 높이 조정
                    height="auto"
                    // 시간 슬롯 간격을 1시간 단위로
                    slotDuration="01:00:00"
                    // 시간 라벨도 1시간마다
                    slotLabelInterval="01:00:00"
                    // 이벤트
                    events={events}
                    eventDidMount={handleEventDidMount}
                    eventWillUnmount={handleEventWillUnmount}
                    // 클릭으로 새 일정
                    dateClick={handleMainSelect}
                    // 이벤트 클릭
                    eventClick={handleMainEventClick}
                    // allDaySlot 여부
                    allDaySlot={false}
                    displayEventTime={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.content}>
        {/* ───────────────── 미니 달력 ───────────────── */}
        <div className={styles.miniCalendar}>
          <FullCalendar
            plugins={pluginMini}
            initialView="dayGridMonth"
            initialDate={mainViewDate}
            locales={localesArray}
            locale="ko"
            headerToolbar={headerToolbarConfig}
            height="275px"
            selectable={true}
            select={handleMiniDateClick}
            events={events}
            // 이벤트 텍스트 표시 안 함 (동그라미만)
            eventDisplay="none"
            // 날짜 셀마다 has-event 클래스 부여
            dayCellClassNames={handleDayCellClassNames}
            dayCellContent={dayCellContent}
          />
        </div>
      </div>
    </div>
  );
};

export default WeekCalendar;
