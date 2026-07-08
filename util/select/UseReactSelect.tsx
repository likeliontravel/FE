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

  const listOptions = useMemo<ScheduleOption[]>(
    () => [
      { value: "restaurants", label: "맛집" },
      { value: "accommodations", label: "숙소" },
      { value: "touristspots", label: "관광지" },
    ],
    [],
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
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor:
            type === "list"
              ? getBackgroundColor(currentValue.value)
              : baseStyles.backgroundColor,
        }),
        option: (baseStyles, state) => {
          if (type !== "list") return baseStyles;

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
};

export default UseReactSelect;
