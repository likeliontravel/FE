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
  ScheduleDetailBody,
  updateScheduleDetail,
} from "../../../util/schedule/scheduleSlice";
import GuideOverlay from "./GuideOverlay";

const REGION_ROWS = [
  ["서울", "인천", "대전", "대구", "광주"],
  ["부산", "울산", "경기", "강원", "충북"],
  ["충남", "세종", "경북", "경남", "전북"],
  ["전남", "제주", "가평", "양평", "강릉"],
  ["경주", "전주", "여수", "춘천", "홍천"],
  ["태안", "통영", "거제", "포항", "안동"],
];

const THEME_LIST = [
  "체험 및 액티비티",
  "자연 속에서 힐링",
  "열정적인 쇼핑투어",
  "미식 여행, 먹방 중심",
  "문화 예술 및 역사 탐방",
];

const EVENT_COLORS: Record<string, { bg: string; txt: string }> = {
  RESTAURANT: { bg: "#FF5F92", txt: "#FFFFFF" },
  TOURISTSPOT: { bg: "#6FC6F4", txt: "#FFFFFF" },
  ACCOMMODATION: { bg: "#C6EE6A", txt: "#5e0e0e" },
};

const getWeekDates = (baseDate: Date) => {
  const startOfWeek = dayjs(baseDate).startOf("week");
  return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, "day"));
};

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
  calendarOptions,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [dbSavedEvents, setDbSavedEvents] = useState<any[]>([]);

  const { events, mainViewDate, currentScheduleId } = useSelector(
    (state: RootState) => state.schedule,
  );
  const selectedSchedule = useSelector(
    (state: RootState) => state.schedule.selectedCalendarSchedule,
  );

  useEffect(() => {
    if (selectedSchedule.value !== "default") {
      const targetSchedule = calendarOptions.find(
        (opt) => String(opt.value) === String(selectedSchedule.value),
      );

      const scheduleStartDate = targetSchedule?.startSchedule;

      if (scheduleStartDate) {
        dispatch(setMainViewDate(scheduleStartDate));
      }

      dispatch(fetchScheduleDetails(selectedSchedule.value)).then((action) => {
        if (fetchScheduleDetails.fulfilled.match(action) && action.payload) {
          const fetchedPlaces = action.payload.schedulePlaces;
          const backupEvents = fetchedPlaces.map((place) => ({
            id: String(place.id),
            start: place.visitStart,
          }));
          setDbSavedEvents(backupEvents);

          if (!scheduleStartDate && fetchedPlaces.length > 0) {
            const sorted = [...fetchedPlaces].sort(
              (a, b) =>
                new Date(a.visitStart).getTime() -
                new Date(b.visitStart).getTime(),
            );

            const firstEventDate = sorted[0].visitStart;

            if (firstEventDate) {
              dispatch(setMainViewDate(firstEventDate));
            }
          }
        }
      });
    } else {
      dispatch(setEvents([]));
      setDbSavedEvents([]);
    }
  }, [selectedSchedule.value, dispatch, calendarOptions]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => event.schedule === selectedSchedule.value)
      .map((event) => {
        const colorSet = EVENT_COLORS[event.category || ""] || {
          bg: "#e2e8f0",
          txt: "#333333",
        };
        return { ...event, color: colorSet.bg, textColor: colorSet.txt };
      });
  }, [events, selectedSchedule]);

  const pluginsMain = useMemo(() => [timeGridPlugin, interactionPlugin], []);
  const localesArray = useMemo(() => [koLocale], []);

  const getSlotElements = useCallback((date: Date) => {
    const timeStr = dayjs(date).format("HH:mm:00");
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return {
      laneEl: document.querySelector(
        `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-lane`,
      ) as HTMLElement | null,
      labelEl: document.querySelector(
        `[data-date="${dateStr}"] [data-time="${timeStr}"].fc-timegrid-slot-label`,
      ) as HTMLElement | null,
    };
  }, []);

  const handleEventDidMount = useCallback(
    (arg: EventMountArg) => {
      if (!arg.event.start) return;
      const { laneEl, labelEl } = getSlotElements(arg.event.start);

      if (laneEl && labelEl) {
        laneEl.classList.remove("selected-slot");
        labelEl.classList.remove("selected-slot");
        laneEl.classList.add("has-event");
        labelEl.classList.add("has-event");

        const bgColor = arg.event.backgroundColor || "#e6e9ee";
        laneEl.style.backgroundColor = bgColor;
        labelEl.style.backgroundColor = bgColor;
      }
    },
    [getSlotElements],
  );

  const handleEventWillUnmount = useCallback(
    (arg: EventMountArg) => {
      if (!arg.event.start) return;
      const { laneEl, labelEl } = getSlotElements(arg.event.start);

      if (laneEl && labelEl) {
        setTimeout(() => {
          const allEvents = arg.view.calendar.getEvents();
          const hasEventInSlot = allEvents.some(
            (e) => e.start?.getTime() === arg.event.start?.getTime(),
          );
          if (!hasEventInSlot) {
            laneEl.classList.remove("has-event", "selected-slot");
            labelEl.classList.remove("has-event", "selected-slot");
            laneEl.style.backgroundColor = "";
            labelEl.style.backgroundColor = "";
          }
        }, 50);
      }
    },
    [getSlotElements],
  );

  const handleMainSelect = useCallback(
    (arg: DateClickArg) => {
      if (selectedSchedule.value === "default") {
        alert("먼저 일정을 선택해주세요.");
        return;
      }

      const { laneEl, labelEl } = getSlotElements(arg.date);
      const dateString = dayjs(arg.date).format("YYYY-MM-DDTHH:mm:ss");

      if (laneEl && labelEl) {
        const isSelected = laneEl.classList.contains("selected-slot");
        if (isSelected) {
          dispatch(removeSelectedSlot(dateString as any));
          laneEl.classList.remove("selected-slot");
          labelEl.classList.remove("selected-slot");
        } else {
          dispatch(addSelectedSlot(dateString as any));
          laneEl.classList.add("selected-slot");
          labelEl.classList.add("selected-slot");
        }
      }
    },
    [dispatch, selectedSchedule, getSlotElements],
  );

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
      RESTAURANT: "RESTAURANT",
      ACCOMMODATION: "ACCOMMODATION",
      TOURISTSPOT: "TOURISTSPOT",
    };

    try {
      const promises: ScheduleDetailBody[] = sortedEvents.map((event) => {
        const startDay = dayjs(event.start).format("YYYY-MM-DD");

        if (startDay !== currentDayStr) {
          currentDayStr = startDay;
          dayOrder += 1;
          orderInDay = 1;
        } else {
          orderInDay += 1;
        }

        const isNewEvent = isNaN(Number(event.id));
        const schedulePlaceId = isNewEvent ? null : Number(event.id);

        return {
          schedulePlaceId: schedulePlaceId,
          contentId: event.contentId || "",
          placeType: typeMap[event.category || ""],
          visitStart: dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss"),
          visitedEnd: dayjs(
            event.end || dayjs(event.start).add(1, "hour"),
          ).format("YYYY-MM-DDTHH:mm:ss"),
          dayOrder: dayOrder,
          orderInDay: orderInDay,
        };
      });

      let actionResult;
      const isUpdate =
        selectedSchedule.value !== "default" && dbSavedEvents.length > 0;

      if (isUpdate) {
        actionResult = await dispatch(
          updateScheduleDetail({ scheduleId, body: promises }),
        );
      } else {
        actionResult = await dispatch(
          createScheduleDetail({ scheduleId, body: promises }),
        );
      }

      const isSuccess = isUpdate
        ? updateScheduleDetail.fulfilled.match(actionResult)
        : createScheduleDetail.fulfilled.match(actionResult);

      if (isSuccess) {
        alert(
          isUpdate
            ? "일정이 성공적으로 수정되었습니다!"
            : "모든 세부 일정이 성공적으로 저장되었습니다!",
        );
        dispatch(fetchScheduleDetails(selectedSchedule.value));
      } else {
        alert(`저장/수정 실패: ${actionResult.payload || "알 수 없는 오류"}`);
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
                {REGION_ROWS.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((region) => (
                      <td
                        key={region}
                        onClick={handleLocationClick}
                        className={
                          selectedLocation === region ? styles.selected : ""
                        }
                      >
                        {region}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "테마" && (
          <div className={styles.theme}>
            {THEME_LIST.map((theme) => (
              <div
                key={theme}
                onClick={handleThemeClick}
                className={selectedTheme === theme ? styles.selected : ""}
              >
                {theme}
              </div>
            ))}
          </div>
        )}
        <div className={styles.create_schedule}>
          <p onClick={handleSaveDetails}>
            {selectedSchedule.value !== "default" && dbSavedEvents.length > 0
              ? "일정 수정하기"
              : "일정 저장하기"}
          </p>
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
