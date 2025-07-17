"use client";

import React, { useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { DateSelectArg } from "@fullcalendar/core";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { setMainViewDate } from "../../store/calendarSlice";
import dayjs from "dayjs";
import styles from "./WeekCalendar.module.scss";

const MiniCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mainViewDate, events } = useSelector((s: RootState) => s.calendar);
  const selectedCalendarSchedule = useSelector(
    (s: RootState) => s.calendar.selectedCalendarSchedule
  );

  const pluginMini = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const handleSelect = useCallback(
    (arg: DateSelectArg) => dispatch(setMainViewDate(arg.start)),
    [dispatch]
  );

  const filteredEvents = useMemo(
    () => events.filter((ev) => ev.schedule === selectedCalendarSchedule.value),
    [events, selectedCalendarSchedule]
  );

  const dayCellClassNames = useCallback(
    (arg: any) => {
      const dateStr = dayjs(arg.date).format("YYYY-MM-DD");
      return filteredEvents.some(
        (ev) => dayjs(ev.start).format("YYYY-MM-DD") === dateStr
      )
        ? ["has-event"]
        : [];
    },
    [filteredEvents]
  );

  return (
    <div className={styles.miniCalendar}>
      <FullCalendar
        plugins={pluginMini}
        initialView="dayGridMonth"
        initialDate={mainViewDate}
        locales={localesArray}
        locale="ko"
        headerToolbar={{ left: "prev", center: "title", right: "next" }}
        height="255px"
        selectable={true}
        select={handleSelect}
        events={filteredEvents}
        eventDisplay="none"
        dayCellClassNames={dayCellClassNames}
        dayCellContent={(arg) => arg.date.getDate().toString()}
        fixedWeekCount={false}
      />
    </div>
  );
};

export default MiniCalendar;
