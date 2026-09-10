'use client';

import React, { useMemo, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import dayjs from 'dayjs';
import styles from './GuideCalendar.module.scss';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const SelectableCalendar: React.FC = () => {
  const plugins = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      const clicked = dayjs(arg.date).format('YYYY-MM-DD');

      if (!startDate || (startDate && endDate)) {
        setStartDate(clicked);
        setEndDate(null);
      } else if (!endDate) {
        if (dayjs(clicked).isBefore(dayjs(startDate))) {
          setStartDate(clicked);
          setEndDate(startDate);
        } else {
          setEndDate(clicked);
        }
      }
    },
    [startDate, endDate]
  );

  const isInRange = (date: string) => {
    if (!startDate) return false;
    if (!endDate) return date === startDate;
    return (
      dayjs(date).isSameOrAfter(startDate) &&
      dayjs(date).isSameOrBefore(endDate)
    );
  };

  const dayCellClassNames = useCallback(
    (arg: any) => {
      const dateStr = dayjs(arg.date).format('YYYY-MM-DD');
      return isInRange(dateStr) ? ['selected'] : [];
    },
    [startDate, endDate]
  );

  return (
    <div className={styles.miniCalendar}>
      <FullCalendar
        plugins={plugins}
        initialView="dayGridMonth"
        locales={localesArray}
        locale="ko"
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        height="255px"
        fixedWeekCount={false}
        dateClick={handleDateClick}
        dayCellClassNames={dayCellClassNames}
        dayCellContent={(arg) => arg.date.getDate().toString()}
      />
    </div>
  );
};

export default SelectableCalendar;
