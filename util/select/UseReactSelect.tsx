"use client";

import { useMemo } from "react";
import Select from "react-select";
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
  TypeOption,
} from "../../util/schedule/scheduleSlice";
import style from "./Select.module.scss";

interface UseReactSelectProps {
  type: "calendar" | "list";
  calendarOptions?: ScheduleOption[];
}

const UseReactSelect = ({ type, calendarOptions }: UseReactSelectProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCalendarSchedule = useSelector(
    (s: RootState) => s.schedule.selectedCalendarSchedule,
  );
  const selectedListSchedule = useSelector(
    (s: RootState) => s.schedule.selectedListSchedule,
  );

  const listOptions = useMemo<TypeOption[]>(
    () => [
      { value: "restaurants", label: "맛집" },
      { value: "accommodations", label: "숙소" },
      { value: "touristspots", label: "관광지" },
    ],
    [],
  );

  const getBackgroundColor = (value: string) => {
    switch (value) {
      case "restaurants":
        return "#FF5F92";
      case "accommodations":
        return "#C6EE6A";
      case "touristspots":
        return "#6FC6F4";
      default:
        return "#bbbbbb";
    }
  };

  if (type === "calendar") {
    return (
      <Select<ScheduleOption, false>
        instanceId="calendar-select"
        classNamePrefix="custom-select-calendar"
        className={style.selectWrapper}
        options={calendarOptions || []}
        value={selectedCalendarSchedule}
        onChange={(newValue) => {
          if (newValue) dispatch(setSelectedCalendarSchedule(newValue));
        }}
        components={{
          Option: CalendarOption,
          SingleValue: CalendarSingleValue,
        }}
        isSearchable={false}
        filterOption={(opt) =>
          opt.data.value !== selectedCalendarSchedule.value &&
          opt.data.value !== "default"
        }
      />
    );
  }

  if (type === "list") {
    return (
      <Select<TypeOption, false>
        instanceId="list-select"
        classNamePrefix="custom-select-list"
        className={style.selectWrapper}
        options={listOptions}
        value={selectedListSchedule}
        onChange={(newValue) => {
          if (newValue) dispatch(setSelectedListSchedule(newValue));
        }}
        components={{
          Option: ListOption,
          SingleValue: ListSingleValue,
        }}
        isSearchable={false}
        filterOption={(opt) => opt.data.value !== selectedListSchedule.value}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: getBackgroundColor(selectedListSchedule.value),
          }),
          option: (baseStyles, state) => {
            const value = state.data.value;
            let hoverBg = "#ff9ebf";
            let hoverText = "#fff";

            if (value === "restaurants") {
              hoverBg = "#FF5F92";
            } else if (value === "accommodations") {
              hoverBg = "#C6EE6A";
              hoverText = "#5e0e0e";
            } else if (value === "touristspots") {
              hoverBg = "#6FC6F4";
            }

            return {
              ...baseStyles,
              backgroundColor: state.isFocused ? hoverBg : "transparent",
              color: state.isFocused ? hoverText : "#333",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background-color 0.2s ease",
            };
          },
        }}
      />
    );
  }

  return null;
};

export default UseReactSelect;
