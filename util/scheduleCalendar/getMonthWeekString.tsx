import dayjs from 'dayjs';

export default function getMonthWeekString(date: Date) {
  const d = dayjs(date);

  // 예) 12월이면 monthStr = "12"
  const monthStr = d.format('M'); // 혹은 (d.month() + 1).toString();

  // 1) 이번 달의 첫 번째 날 (예: 12/1)이 무슨 요일인지 (일요일=0, 월요일=1, ...)
  const firstDayOfMonth = d.startOf('month').day(); // 0 ~ 6
  // 2) 현재 날짜가 몇 일째인지 (1일=1, 2일=2, ...)
  const dayOfMonth = d.date(); // 1 ~ 31
  // 3) (현재 일자 + 첫날의 요일)로 offset 계산
  //    예) 12/1이 수요일(3)이고 오늘이 12/5면 offset=5+3=8
  const offset = dayOfMonth + firstDayOfMonth;
  // 4) offset을 7로 나눈 뒤 올림(Ceil)을 하면 "몇 주차"인지 구할 수 있음
  const week = Math.ceil(offset / 7);

  return `${monthStr}월 ${week}주차`;
}
