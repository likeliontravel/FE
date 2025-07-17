'use client';

import { useState } from 'react';
import WeekCalendar from '../../../util/scheduleCalendar/WeekCalendar';
import ScheduleList from '../../../util/scheduleList/ScheduleList';
import TourOverlay from './TourOverlay';

const SchedulePage = () => {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <>
      <WeekCalendar />
      <ScheduleList />
      {showGuide && <TourOverlay onClose={() => setShowGuide(false)} />}
    </>
  );
};

export default SchedulePage;
