"use client";

import { useState } from "react";
import WeekCalendar from "../../../util/schedule/scheduleCalendar/WeekCalendar";
import ScheduleList from "../../../util/schedule/scheduleList/ScheduleList";
import TourOverlay from "./TourOverlay";

const SchedulePage = () => {
  const [selectedLocation, setSelectedLocation] = useState("서울");
  const [selectedTheme, setSelectedTheme] = useState("체험/액티비티");
  const [showGuide, setShowGuide] = useState(true);

  return (
    <>
      <WeekCalendar
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
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
