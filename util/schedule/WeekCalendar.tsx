// 'use client';

// import React, { useState } from 'react';
// import FullCalendar, {
//   DateSelectArg,
//   EventClickArg,
//   DatesSetArg,
// } from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import koLocale from '@fullcalendar/core/locales/ko';

// import styles from './WeekCalendar.module.scss';

// interface CalendarEvent {
//   id: string;
//   title: string;
//   start: string;
//   end?: string;
// }

// const WeekCalendar = () => {
//   // 일정 데이터
//   const [events, setEvents] = useState<CalendarEvent[]>([
//     {
//       id: '1',
//       title: '회의',
//       start: '2025-03-26T10:00:00',
//       end: '2025-03-26T11:00:00',
//     },
//     { id: '2', title: '점심약속', start: '2025-03-27T12:00:00' },
//   ]);

//   // 메인 스케줄(주간)에서 표시할 날짜
//   const [mainViewDate, setMainViewDate] = useState(new Date());

//   // 미니 달력에서 날짜 클릭 → 메인 스케줄 이동
//   const handleMiniDateClick = (arg: DateSelectArg) => {
//     setMainViewDate(arg.start);
//   };

//   // 메인 스케줄에서 날짜 범위 바뀔 때
//   const handleMainDatesSet = (arg: DatesSetArg) => {
//     // 필요시 동기화 로직
//   };

//   // 메인 스케줄 이벤트 클릭
//   const handleMainEventClick = (arg: EventClickArg) => {
//     alert(`이벤트 클릭: ${arg.event.title}`);
//   };

//   // 메인 스케줄 빈 영역 드래그 → 새 일정 추가
//   const handleMainSelect = (arg: DateSelectArg) => {
//     const newEvent: CalendarEvent = {
//       id: String(Date.now()),
//       title: '새 일정',
//       start: arg.startStr,
//       end: arg.endStr,
//     };
//     setEvents((prev) => [...prev, newEvent]);
//   };

//   // 날짜에 이벤트가 있는지 검사
//   const hasEventOnDate = (date: Date) => {
//     const dayYmd = date.toISOString().split('T')[0];
//     return events.some((ev) => {
//       const start = new Date(ev.start);
//       const end = ev.end ? new Date(ev.end) : start;
//       const startYmd = start.toISOString().split('T')[0];
//       const endYmd = end.toISOString().split('T')[0];
//       return dayYmd >= startYmd && dayYmd <= endYmd;
//     });
//   };

//   // 날짜 셀마다 클래스를 부여 (이 콜백은 이벤트 변경 시마다 재실행)
//   const handleDayCellClassNames = (arg: any) => {
//     if (hasEventOnDate(arg.date)) {
//       return ['has-event'];
//     }
//     return [];
//   };

//   return (
//     <div className={styles.container}>
//       {/* 상단 바 */}
//       <div className={styles.topBar}>
//         <h2>스케줄 + 미니 달력 예시</h2>
//       </div>

//       <div className={styles.content}>
//         {/* 미니 달력 */}
//         <div className={styles.miniCalendar}>
//           <FullCalendar
//             plugins={[dayGridPlugin, interactionPlugin]}
//             initialView="dayGridMonth"
//             initialDate={mainViewDate}
//             locales={[koLocale]}
//             locale="ko"
//             headerToolbar={{
//               left: 'prev',
//               center: 'title',
//               right: 'next',
//             }}
//             height="275px"
//             selectable={true}
//             select={handleMiniDateClick}
//             events={events}
//             // 이벤트 텍스트 표시 안 함 (동그라미만)
//             eventDisplay="none"
//             // 날짜 셀마다 has-event 클래스 부여
//             dayCellClassNames={handleDayCellClassNames}
//             dayCellContent={(arg) => {
//               return arg.date.getDate().toString();
//             }}
//           />
//         </div>

//         {/* 메인 스케줄 (주간) */}
//         <div className={styles.mainSchedule}>
//           <FullCalendar
//             plugins={[timeGridPlugin, interactionPlugin]}
//             initialView="timeGridWeek"
//             locales={[koLocale]}
//             locale="ko"
//             headerToolbar={{
//               left: 'prev,next today',
//               center: 'title',
//               right: 'timeGridWeek,timeGridDay',
//             }}
//             initialDate={mainViewDate}
//             datesSet={handleMainDatesSet}
//             events={events}
//             selectable={true}
//             select={handleMainSelect}
//             eventClick={handleMainEventClick}
//             nowIndicator={true}
//             slotMinTime="05:00:00"
//             slotMaxTime="14:00:00"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WeekCalendar;
