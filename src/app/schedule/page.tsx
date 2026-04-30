"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchUserGroups } from "../../../util/group/groupSlice";
import { ScheduleOption } from "../../../store/calendarSlice";
import { api } from "../../../util/api";
import dayjs from "dayjs";
import WeekCalendar from "../../../util/schedule/scheduleCalendar/WeekCalendar";
import ScheduleList from "../../../util/schedule/scheduleList/ScheduleList";
import TourOverlay from "./TourOverlay";

const SchedulePage = () => {
  const [selectedLocation, setSelectedLocation] = useState("서울");
  const [selectedTheme, setSelectedTheme] = useState("체험 및 액티비티");
  const [showGuide, setShowGuide] = useState(true);

  const [calendarOptions, setCalendarOptions] = useState<ScheduleOption[]>([
    { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
  ]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUserGroups());

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

          setCalendarOptions([
            { value: "default", label: "-", prefix: "내일정", suffix: "D-" },
            ...apiOptions,
          ]);
        }
      } catch (error) {
        console.error("일정 목록을 불러오는데 실패했습니다.", error);
      }
    };

    fetchSchedules();
  }, [dispatch]);

  const groups = useSelector((state: RootState) => state.group.groups);

  return (
    <>
      <WeekCalendar
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        groups={groups}
        calendarOptions={calendarOptions}
      />
      <ScheduleList
        selectedLocation={selectedLocation}
        selectedTheme={selectedTheme}
      />
      {showGuide && <TourOverlay onClose={() => setShowGuide(false)} />}
    </>
  );
};

export default SchedulePage;
