// components/select/UseReactSelect.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select, { SingleValue, ActionMeta } from "react-select";
import CalendarOption from "./CalendarOption";
import ListOption from "./ListOption";
import CalendarSingleValue from "./CalendarSingleValue";
import ListSingleValue from "./ListSingleValue";
import "./Select.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setSelectedCalendarSchedule,
  setSelectedListSchedule,
  ScheduleOption,
} from "../../store/calendarSlice";
import style from "./Select.module.scss";
import dayjs from "dayjs";
import { api } from "../api";

interface UseReactSelectProps {
  type: "calendar" | "list";
}

const UseReactSelect = ({ type }: UseReactSelectProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCalendarSchedule = useSelector(
    (s: RootState) => s.calendar.selectedCalendarSchedule,
  );
  const selectedListSchedule = useSelector(
    (s: RootState) => s.calendar.selectedListSchedule,
  );

  const [fetchedCalendarOptions, setFetchedCalendarOptions] = useState<
    ScheduleOption[]
  >([
    { value: "default", label: "-", prefix: "내일정", suffix: "D-" }, // 기본값
  ]);

  useEffect(() => {
    if (type === "calendar") {
      const fetchSchedules = async () => {
        try {
          const res = await api.get("/schedule/getList");

          if (res.data.success && res.data.data) {
            const apiOptions = res.data.data.map((item: any) => {
              const today = dayjs().startOf("day");
              const targetDate = dayjs(item.startSchedule).startOf("day");
              const diffDays = targetDate.diff(today, "day");

              let dDayString = "";
              if (diffDays === 0) dDayString = "D-Day";
              else if (diffDays > 0) dDayString = `D-${diffDays}`;
              else dDayString = `D+${Math.abs(diffDays)}`;

              return {
                value: item.groupName,
                label: `${item.scheduleFirstRegion} 여행`,
                prefix: item.groupName,
                suffix: dDayString,
              };
            });

            setFetchedCalendarOptions([
              { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
              ...apiOptions,
            ]);
          }
        } catch (error) {
          console.error("일정 목록을 불러오는데 실패했습니다.", error);
        }
      };

      fetchSchedules();
    }
  }, [type]);

  const listOptions = useMemo<ScheduleOption[]>(
    () => [
      { value: "restaurant", label: "맛집" },
      { value: "hotel", label: "숙소" },
      { value: "tourist_spot", label: "관광지" },
    ],
    [],
  );

  const { options, customComponents, currentValue, onChangeAction } =
    useMemo(() => {
      if (type === "calendar") {
        return {
          options: fetchedCalendarOptions,
          customComponents: {
            Option: CalendarOption,
            SingleValue: CalendarSingleValue,
          },
          currentValue: selectedCalendarSchedule,
          onChangeAction: setSelectedCalendarSchedule,
        };
      } else {
        return {
          options: listOptions,
          customComponents: {
            Option: ListOption,
            SingleValue: ListSingleValue,
          },
          currentValue: selectedListSchedule,
          onChangeAction: setSelectedListSchedule,
        };
      }
    }, [
      type,
      selectedCalendarSchedule,
      selectedListSchedule,
      fetchedCalendarOptions,
      listOptions,
    ]);

  const handleChange = useCallback(
    (
      newValue: SingleValue<ScheduleOption>,
      _meta: ActionMeta<ScheduleOption>,
    ) => {
      if (newValue) dispatch(onChangeAction(newValue));
    },
    [dispatch, onChangeAction],
  );

  const filterOptions = useCallback(
    (opt: any) =>
      opt.data.value !== currentValue.value && opt.data.value !== "default",
    [currentValue],
  );

  return (
    <Select<ScheduleOption, false>
      instanceId={type === "calendar" ? "calendar-select" : "list-select"}
      classNamePrefix={
        type === "calendar" ? "custom-select-calendar" : "custom-select-list"
      }
      className={style.selectWrapper}
      options={options}
      value={currentValue}
      onChange={handleChange}
      components={customComponents}
      isSearchable={false}
      filterOption={filterOptions}
    />
  );
};

export default UseReactSelect;
