'use client';

import React, { useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { DateSelectArg } from '@fullcalendar/core';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setMainViewDate } from '../../store/calendarSlice';

import styles from './WeekCalendar.module.scss';
import dayjs from 'dayjs';

const MiniCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mainViewDate, events } = useSelector(
    (state: RootState) => state.calendar
  );

  const pluginMini = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const handleSelect = useCallback(
    (arg: DateSelectArg) => {
      dispatch(setMainViewDate(arg.start));
    },
    [dispatch]
  );

  const dayCellClassNames = useCallback(
    (arg: any): string[] => {
      const cellDateStr = dayjs(arg.date).format('YYYY-MM-DD');
      const hasEvent = events.some(
        (ev) => dayjs(ev.start).format('YYYY-MM-DD') === cellDateStr
      );
      return hasEvent ? ['has-event'] : [];
    },
    [events]
  );

  const dayCellContent = useCallback((arg: any): React.ReactNode => {
    return arg.date.getDate().toString();
  }, []);

  const headerToolbarConfig = useMemo(
    () => ({
      left: 'prev',
      center: 'title',
      right: 'next',
    }),
    []
  );

  return (
    <div className={styles.miniCalendar}>
      <FullCalendar
        plugins={pluginMini}
        initialView="dayGridMonth"
        initialDate={mainViewDate}
        locales={localesArray}
        locale="ko"
        headerToolbar={headerToolbarConfig}
        height="255px"
        selectable={true}
        select={handleSelect}
        events={events}
        eventDisplay="none"
        dayCellClassNames={dayCellClassNames}
        dayCellContent={dayCellContent}
        fixedWeekCount={false}
      />
    </div>
  );
};

export default MiniCalendar;
