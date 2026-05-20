"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchUserGroups } from "../../../util/group/groupSlice";
import { fetchScheduleList } from "../../../util/schedule/scheduleSlice";
import WeekCalendar from "../../../util/schedule/scheduleCalendar/WeekCalendar";
import ScheduleList from "../../../util/schedule/scheduleList/ScheduleList";
import TourOverlay from "./TourOverlay";

const SchedulePage = () => {
  const [selectedLocation, setSelectedLocation] = useState("서울");
  const [selectedTheme, setSelectedTheme] = useState("체험 및 액티비티");
  const [showGuide, setShowGuide] = useState(true);

  const dispatch = useDispatch<AppDispatch>();

  const groups = useSelector((state: RootState) => state.group.groups);
  const calendarOptions = useSelector(
    (state: RootState) => state.schedule.scheduleList,
  );

  useEffect(() => {
    dispatch(fetchUserGroups());
    dispatch(fetchScheduleList());
  }, [dispatch]);

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
