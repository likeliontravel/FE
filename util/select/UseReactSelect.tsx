// components/select/UseReactSelect.tsx
"use client";

import React, { useCallback, useMemo } from "react";
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

interface UseReactSelectProps {
  type: "calendar" | "list";
}

const UseReactSelect = ({ type }: UseReactSelectProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCalendarSchedule = useSelector(
    (s: RootState) => s.calendar.selectedCalendarSchedule
  );
  const selectedListSchedule = useSelector(
    (s: RootState) => s.calendar.selectedListSchedule
  );

  const calendarOptions = useMemo<ScheduleOption[]>(
    () => [
      { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
      {
        value: "trip_sokcho",
        label: "속초 여행",
        prefix: "멋사",
        suffix: "D-21",
      },
      {
        value: "trip_jeju",
        label: "제주도 여행",
        prefix: "가나다라",
        suffix: "D-21",
      },
    ],
    []
  );

  const listOptions = useMemo<ScheduleOption[]>(
    () => [
      { value: "restaurant", label: "맛집" },
      { value: "hotel", label: "숙소" },
      { value: "tourist_spot", label: "관광지" },
    ],
    []
  );

  const { options, customComponents, currentValue, onChangeAction } =
    useMemo(() => {
      if (type === "calendar") {
        return {
          options: calendarOptions,
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
      calendarOptions,
      listOptions,
    ]);

  const handleChange = useCallback(
    (
      newValue: SingleValue<ScheduleOption>,
      _meta: ActionMeta<ScheduleOption>
    ) => {
      if (newValue) dispatch(onChangeAction(newValue));
    },
    [dispatch, onChangeAction]
  );

  const filterOptions = useCallback(
    (opt: any) =>
      opt.data.value !== currentValue.value && opt.data.value !== "default",
    [currentValue]
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
      defaultValue={options[0]}
      isSearchable={false}
      filterOption={filterOptions}
    />
  );
};

export default UseReactSelect;
