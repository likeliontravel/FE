"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { DateClickArg } from "@fullcalendar/interaction";
import { EventMountArg } from "@fullcalendar/core";

import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import UseReactSelect from "../../select/UseReactSelect";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

import styles from "./WeekCalendar.module.scss";
import getMonthWeekString from "./getMonthWeekString";
import MiniCalendar from "./MiniCalendar";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  addSelectedSlot,
  fetchScheduleDetails,
  removeSelectedSlot,
  setEvents,
  createScheduleDetail,
  ScheduleOption,
  setMainViewDate,
} from "../../../util/schedule/scheduleSlice";
import GuideOverlay from "./GuideOverlay";

interface WeekCalendarProps {
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  groups: any[];
  calendarOptions: ScheduleOption[];
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedLocation,
  setSelectedLocation,
  selectedTheme,
  setSelectedTheme,
  groups,
  calendarOptions,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, mainViewDate, currentScheduleId } = useSelector(
    (state: RootState) => state.schedule,
  );
  const selectedSchedule = useSelector(
    (state: RootState) => state.schedule.selectedCalendarSchedule,
  );

  useEffect(() => {
    if (selectedSchedule.value !== "default") {
      dispatch(fetchScheduleDetails(selectedSchedule.value)).then((action) => {
        if (fetchScheduleDetails.fulfilled.match(action) && action.payload) {
          const fetchedEvents = action.payload.events;

          if (fetchedEvents && fetchedEvents.length > 0) {
            const sorted = [...fetchedEvents].sort(
              (a, b) =>
                new Date(a.visitStart).getTime() -
                new Date(b.visitStart).getTime(),
            );

            const firstEventDate = sorted[0].visitStart;

            if (firstEventDate) {
              dispatch(setMainViewDate(new Date(firstEventDate)));
            }
          }
        }
      });
    } else {
      dispatch(setEvents([]));
    }
  }, [selectedSchedule.value, dispatch]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => event.schedule === selectedSchedule.value)
      .map((event) => {
        let bgColor = "#e2e8f0";
        let txtColor = "#333333";

        if (event.category === "restaurant") {
          bgColor = "#FF5F92";
          txtColor = "#FFFFFF";
        } else if (event.category === "tourist_spot") {
          bgColor = "#6FC6F4";
          txtColor = "#FFFFFF";
        } else if (event.category === "hotel") {
          bgColor = "#C6EE6A";
          txtColor = "#333333";
        }

        return {
          ...event,
          color: bgColor,
          textColor: txtColor,
        };
      });
  }, [events, selectedSchedule]);

  const pluginsMain = useMemo(() => [timeGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const handleEventDidMount = useCallback((arg: EventMountArg) => {
    const start = arg.event.start;
    if (!start) return;

    const timeStr = dayjs(start).format("HH:mm:00");
    const dateStr = dayjs(start).format("YYYY-MM-DD");

    const slotLaneEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`,
    ) as HTMLElement;
    const slotLabelEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`,
    ) as HTMLElement;
    if (slotLaneEl && slotLabelEl) {
      slotLaneEl.classList.remove("selected-slot");
      slotLabelEl.classList.remove("selected-slot");

      slotLaneEl.classList.add("has-event");
      slotLabelEl.classList.add("has-event");

      const bgColor = arg.event.backgroundColor || "#e6e9ee";
      slotLaneEl.style.backgroundColor = bgColor;
      slotLabelEl.style.backgroundColor = bgColor;
    }
  }, []);

  const handleEventWillUnmount = useCallback((arg: EventMountArg) => {
    const start = arg.event.start;
    if (!start) return;

    const timeStr = dayjs(start).format("HH:mm:00");
    const dateStr = dayjs(start).format("YYYY-MM-DD");

    const slotLaneEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`,
    ) as HTMLElement;
    const slotLabelEl = document.querySelector(
      `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`,
    ) as HTMLElement;
    if (slotLaneEl && slotLabelEl) {
      slotLaneEl.classList.remove("has-event", "selected-slot");
      slotLabelEl.classList.remove("has-event", "selected-slot");
      slotLaneEl.style.backgroundColor = "";
      slotLabelEl.style.backgroundColor = "";
    }
  }, []);

  const handleMainSelect = useCallback(
    (arg: DateClickArg) => {
      if (selectedSchedule.value === "default") {
        alert("먼저 일정을 선택해주세요.");
        return;
      }

      dispatch(addSelectedSlot(arg.date));
      const timeStr = dayjs(arg.date).format("HH:mm:00");
      const dateStr = dayjs(arg.date).format("YYYY-MM-DD");
      const slotLaneEl = document.querySelector(
        `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`,
      );
      const slotLabelEl = document.querySelector(
        `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`,
      );
      if (slotLaneEl && slotLabelEl) {
        const isSelected = slotLaneEl.classList.contains("selected-slot");
        if (isSelected) {
          dispatch(removeSelectedSlot(arg.date));
          slotLaneEl.classList.remove("selected-slot");
          slotLabelEl.classList.remove("selected-slot");
        } else {
          dispatch(addSelectedSlot(arg.date));
          slotLaneEl.classList.add("selected-slot");
          slotLabelEl.classList.add("selected-slot");
        }
      }
    },
    [dispatch, selectedSchedule],
  );

  const getWeekDates = (baseDate: Date) => {
    const startOfWeek = dayjs(baseDate).startOf("week");
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, "day"));
  };

  const weekDates = getWeekDates(new Date(mainViewDate));
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenDays((prev) => {
      const next = { ...prev };
      let shouldUpdate = false;

      // 현재 선택된 일정이 존재하는 날짜들도 자동으로 열기
      filteredEvents.forEach((event) => {
        const eventDateStr = dayjs(event.start).format("YYYY-MM-DD");
        if (!next[eventDateStr]) {
          next[eventDateStr] = true;
          shouldUpdate = true;
        }
      });

      return shouldUpdate ? next : prev;
    });

    // FullCalendar가 닫혀있다가 열리면서 사이즈가 깨지지 않도록 재계산 트리거 발동
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    });

    return () => clearTimeout(timer);
  }, [mainViewDate, filteredEvents]);

  const handleDayColumnClick = useCallback(
    (event: React.MouseEvent, dateStr: string) => {
      if ((event.target as HTMLElement).classList.contains(styles.dayHeader)) {
        setOpenDays((prev) => ({
          ...prev,
          [dateStr]: !prev[dateStr],
        }));
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }
    },
    [],
  );

  const getDayColumnClickHandler = useCallback(
    (dateStr: string) => (event: React.MouseEvent) =>
      handleDayColumnClick(event, dateStr),
    [handleDayColumnClick],
  );

  const slotLabelContent = useCallback((arg: any) => {
    const hour = arg.date.getHours();
    const hourStr = String(hour).padStart(2, "0");
    return hourStr + " -";
  }, []);

  const gridTemplateColumns = useMemo(() => {
    return weekDates
      .map((day) => {
        const dayStr = day.format("YYYY-MM-DD");
        return openDays[dayStr] ? "2fr" : "1fr";
      })
      .join(" ");
  }, [weekDates, openDays]);

  const dayColumnDivStyle = useMemo<React.CSSProperties>(
    () => ({ gridTemplateColumns }),
    [gridTemplateColumns],
  );

  const [activeTab, setActiveTab] = useState("지역");

  const createClickHandler = useCallback(
    (setter: any) => (e: any) => {
      const value = e.currentTarget.textContent?.trim();
      if (value) {
        setter(value);
      }
    },
    [],
  );

  const [showGuide, setShowGuide] = useState(false);

  const handleTabClick = createClickHandler(setActiveTab);
  const handleLocationClick = createClickHandler(setSelectedLocation);
  const handleThemeClick = createClickHandler(setSelectedTheme);

  const handleSaveDetails = async () => {
    if (selectedSchedule.value === "default") {
      alert("먼저 드롭다운에서 저장할 일정을 선택해주세요.");
      return;
    }

    if (filteredEvents.length === 0) {
      alert("달력에 추가된 세부 일정이 없습니다.");
      return;
    }

    if (!currentScheduleId) {
      alert("일정 ID를 찾을 수 없습니다. 일정을 다시 불러와주세요.");
      return;
    }
    const scheduleId = currentScheduleId;

    const sortedEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    let currentDayStr = "";
    let dayOrder = 0;
    let orderInDay = 0;

    const typeMap: Record<string, string> = {
      restaurant: "RESTAURANT",
      hotel: "ACCOMMODATION",
      tourist_spot: "TOURISTSPOT",
    };

    try {
      const promises = sortedEvents.map((event) => {
        const startDay = dayjs(event.start).format("YYYY-MM-DD");

        if (startDay !== currentDayStr) {
          currentDayStr = startDay;
          dayOrder += 1;
          orderInDay = 1;
        } else {
          orderInDay += 1;
        }

        const bodyData = {
          contentId: event.id.split("-")[0],
          placeType: typeMap[event.category || ""],
          visitStart: dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss"),
          visitedEnd: dayjs(
            event.end || dayjs(event.start).add(1, "hour"),
          ).format("YYYY-MM-DDTHH:mm:ss"),
          dayOrder: dayOrder,
          orderInDay: orderInDay,
        };

        return dispatch(createScheduleDetail({ scheduleId, body: bodyData }));
      });

      const results = await Promise.all(promises);

      const hasError = results.some((res) =>
        createScheduleDetail.rejected.match(res),
      );

      if (hasError) {
        alert("일부 세부 일정 저장에 실패했습니다. 다시 시도해주세요.");
      } else {
        alert("모든 세부 일정이 성공적으로 저장되었습니다!");
      }
    } catch (error) {
      console.error("세부 일정 저장 에러:", error);
      alert("세부 일정을 저장하는 중 시스템 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      {/* ──────────────── 메인 스케줄(요일별) ──────────────── */}
      <div className={styles.mainScheduleDays}>
        <div className={styles.daySelect}>
          <p>{getMonthWeekString(new Date(mainViewDate))}</p>
          <UseReactSelect type="calendar" calendarOptions={calendarOptions} />
        </div>
        <div className={styles.dayColumnDiv} style={dayColumnDivStyle}>
          {weekDates.map((day) => {
            const dayStr = day.format("YYYY-MM-DD");
            const isOpen = openDays[dayStr] ?? false;

            return (
              <div
                key={dayStr}
                className={`${styles.dayColumn} ${isOpen ? styles.expanded : styles.collapsed}`}
                onClick={getDayColumnClickHandler(dayStr)}
                data-date={dayStr}
              >
                {/* 날짜 헤더 */}
                <h3 className={styles.dayHeader}>{day.format("D (ddd)")}</h3>

                {isOpen && (
                  <FullCalendar
                    // Day 단위
                    initialView="timeGridDay"
                    // 각 날짜마다 다른 initialDate
                    initialDate={dayStr}
                    dayHeaders={false}
                    plugins={pluginsMain}
                    locales={localesArray}
                    locale="ko"
                    headerToolbar={false}
                    slotLabelContent={slotLabelContent}
                    // 시간 범위 (05:00 ~ 자정)
                    slotMinTime="05:00:00"
                    slotMaxTime="24:00:00"
                    // 높이 조정
                    height="auto"
                    // 시간 슬롯 간격을 1시간 단위로
                    slotDuration="01:00:00"
                    // 시간 라벨도 1시간마다
                    slotLabelInterval="01:00:00"
                    // 이벤트
                    events={filteredEvents}
                    eventDidMount={handleEventDidMount}
                    eventWillUnmount={handleEventWillUnmount}
                    dateClick={handleMainSelect}
                    // allDaySlot 여부
                    allDaySlot={false}
                    displayEventTime={false}
                    // 같은 시간대 이벤트 겹침 허용 안 함
                    slotEventOverlap={false}
                    eventOverlap={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.content}>
        {/* ───────────────── 미니 달력 ───────────────── */}
        <MiniCalendar />
        <div className={styles.switch}>
          <div
            className={activeTab === "지역" ? styles.active : styles.non_active}
            onClick={handleTabClick}
          >
            지역
          </div>
          <div
            className={activeTab === "테마" ? styles.active : styles.non_active}
            onClick={handleTabClick}
          >
            테마
          </div>
        </div>
        {activeTab === "지역" && (
          <div className={styles.locate}>
            <table>
              <tbody>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "서울" ? styles.selected : ""
                    }
                  >
                    서울
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "인천" ? styles.selected : ""
                    }
                  >
                    인천
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "대전" ? styles.selected : ""
                    }
                  >
                    대전
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "대구" ? styles.selected : ""
                    }
                  >
                    대구
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "광주" ? styles.selected : ""
                    }
                  >
                    광주
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "부산" ? styles.selected : ""
                    }
                  >
                    부산
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "울산" ? styles.selected : ""
                    }
                  >
                    울산
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "경기" ? styles.selected : ""
                    }
                  >
                    경기
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "강원" ? styles.selected : ""
                    }
                  >
                    강원
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "충북" ? styles.selected : ""
                    }
                  >
                    충북
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "충남" ? styles.selected : ""
                    }
                  >
                    충남
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "세종" ? styles.selected : ""
                    }
                  >
                    세종
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "경북" ? styles.selected : ""
                    }
                  >
                    경북
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "경남" ? styles.selected : ""
                    }
                  >
                    경남
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "전북" ? styles.selected : ""
                    }
                  >
                    전북
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "전남" ? styles.selected : ""
                    }
                  >
                    전남
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "제주" ? styles.selected : ""
                    }
                  >
                    제주
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "가평" ? styles.selected : ""
                    }
                  >
                    가평
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "양평" ? styles.selected : ""
                    }
                  >
                    양평
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "강릉" ? styles.selected : ""
                    }
                  >
                    강릉
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "경주" ? styles.selected : ""
                    }
                  >
                    경주
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "전주" ? styles.selected : ""
                    }
                  >
                    전주
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "여수" ? styles.selected : ""
                    }
                  >
                    여수
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "춘천" ? styles.selected : ""
                    }
                  >
                    춘천
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "홍천" ? styles.selected : ""
                    }
                  >
                    홍천
                  </td>
                </tr>
                <tr>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "태안" ? styles.selected : ""
                    }
                  >
                    태안
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "통영" ? styles.selected : ""
                    }
                  >
                    통영
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "거제" ? styles.selected : ""
                    }
                  >
                    거제
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "포항" ? styles.selected : ""
                    }
                  >
                    포항
                  </td>
                  <td
                    onClick={handleLocationClick}
                    className={
                      selectedLocation === "안동" ? styles.selected : ""
                    }
                  >
                    안동
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "테마" && (
          <div className={styles.theme}>
            <div
              onClick={handleThemeClick}
              className={
                selectedTheme === "체험 및 액티비티" ? styles.selected : ""
              }
            >
              체험 및 액티비티
            </div>
            <div
              onClick={handleThemeClick}
              className={
                selectedTheme === "자연 속에서 힐링" ? styles.selected : ""
              }
            >
              자연 속에서 힐링
            </div>
            <div
              onClick={handleThemeClick}
              className={
                selectedTheme === "열정적인 쇼핑투어" ? styles.selected : ""
              }
            >
              열정적인 쇼핑투어
            </div>
            <div
              onClick={handleThemeClick}
              className={
                selectedTheme === "미식 여행, 먹방 중심" ? styles.selected : ""
              }
            >
              미식 여행, 먹방 중심
            </div>
            <div
              onClick={handleThemeClick}
              className={
                selectedTheme === "문화 예술 및 역사 탐방"
                  ? styles.selected
                  : ""
              }
            >
              문화 예술 및 역사 탐방
            </div>
          </div>
        )}
        <div className={styles.create_schedule}>
          <p onClick={handleSaveDetails}>일정 저장하기</p>
        </div>

        {/* <div onClick={() => setShowGuide(true)} className={styles.ai_schedule}>
          AI 맞춤 일정 구성하기
        </div> */}
      </div>

      {showGuide && <GuideOverlay onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default WeekCalendar;
