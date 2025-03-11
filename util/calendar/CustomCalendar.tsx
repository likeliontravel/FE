'use client';

// import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';

// 한국어 로케일
// import koLocale from '@fullcalendar/core/locales/ko';

import './CustomCalendar.css';

const CustomCalendar = () => {
  // const [currentDate, setCurrentDate] = useState(new Date());

  // // 날짜가 변경될 때(이전/다음 달 이동 등) 실행되는 콜백
  // const handleDatesSet = (arg: any) => {
  //   const newDate = arg.view.currentStart;
  //   // 이전 날짜와 다를 때만 업데이트
  //   if (newDate.toDateString() !== currentDate.toDateString()) {
  //     setCurrentDate(newDate);
  //   }
  // };

  return (
    <div className="mini-calendar-container">
      <FullCalendar
        // plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        // 한국어 적용
        // locales={[koLocale]}
        locale="ko"
        // 헤더 설정 (이전달/다음달 버튼 + 중앙에 월/연도)
        // headerToolbar={{
        //   left: 'prev',
        //   center: 'title',
        //   right: 'next',
        // }}
        // 월간 달력 높이 자동조절
        height="auto"
        // 이번 달 이외의 날짜(이전/다음 달)도 표시
        showNonCurrentDates={true}
        // 날짜가 변경될 때마다 실행 (이전/다음 달 이동 등)
        // datesSet={handleDatesSet}
        // 제목 포맷(예: "2024년 12월")을 세밀하게 조정하고 싶다면 아래처럼:
        // titleFormat={(date) => `${date.date.year}년 ${date.date.month + 1}월`}
        // 주(week) 개수를 고정하지 않으려면 (마지막 줄만 표시)
        fixedWeekCount={false}
        /* 날짜 셀에 표시될 내용을 직접 정의 */
        // dayCellContent={(arg) => {
        //   // 예: 'arg.date.getDate()' -> 1, 2, 3... 숫자만 추출
        //   return arg.date.getDate().toString();
        // }}
      />
    </div>
  );
};

export default CustomCalendar;
