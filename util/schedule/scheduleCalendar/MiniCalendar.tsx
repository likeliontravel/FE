"use client";

import React, { useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { DateSelectArg } from "@fullcalendar/core";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { setMainViewDate } from "../../../util/schedule/scheduleSlice";
import dayjs from "dayjs";
import styles from "./WeekCalendar.module.scss";

const MiniCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mainViewDate, events, scheduleList } = useSelector(
    (s: RootState) => s.schedule,
  );
  const selectedCalendarSchedule = useSelector(
    (s: RootState) => s.schedule.selectedCalendarSchedule,
  );

  const pluginMini = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const handleSelect = useCallback(
    (arg: DateSelectArg) => dispatch(setMainViewDate(arg.start)),
    [dispatch],
  );

  const filteredEvents = useMemo(
    () => events.filter((ev) => ev.schedule === selectedCalendarSchedule.value),
    [events, selectedCalendarSchedule],
  );

  const currentTrip = useMemo(() => {
    return scheduleList.find(
      (opt) => opt.value === selectedCalendarSchedule.value,
    );
  }, [scheduleList, selectedCalendarSchedule.value]);

  const dayCellClassNames = useCallback(
    (arg: any) => {
      const classes = [];
      const cellTime = dayjs(arg.date).startOf("day").valueOf();

      const hasEvent = filteredEvents.some(
        (ev) => dayjs(ev.start).startOf("day").valueOf() === cellTime,
      );
      if (hasEvent) {
        classes.push("has-event");
      }

      if (currentTrip?.startSchedule && currentTrip?.endSchedule) {
        const startTime = dayjs(currentTrip.startSchedule)
          .startOf("day")
          .valueOf();
        const endTime = dayjs(currentTrip.endSchedule).startOf("day").valueOf();

        if (cellTime >= startTime && cellTime <= endTime) {
          classes.push("in-trip-range");
        }
      }

      return classes;
    },
    [filteredEvents, currentTrip],
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
