'use client';

import React, { useState, useCallback } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';

const CustomCalendar = () => {
  const [value, setValue] = useState<CalendarProps['value']>(new Date());

  const handleDateChange: CalendarProps['onChange'] = useCallback(
    (newValue: any) => {
      if (Array.isArray(newValue)) {
        setValue(newValue[0]);
      } else {
        setValue(newValue);
      }
    },
    []
  );

  const getTileClassName = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      const selectedDate = Array.isArray(value) ? value[0] : value;
      const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
      return view === 'month' &&
        selectedDateObj &&
        date.toDateString() === selectedDateObj.toDateString()
        ? 'selected-date'
        : '';
    },
    [value]
  );

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={value}
        locale="ko-KR"
        calendarType="gregory"
        next2Label={null}
        prev2Label={null}
        formatDay={useCallback((locale: any, date: any) => date.getDate(), [])}
        showNeighboringMonth={true}
        tileClassName={getTileClassName}
      />
    </div>
  );
};

export default CustomCalendar;
