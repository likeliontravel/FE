// components/schedule/ScheduleList.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UseReactSelect from "../select/UseReactSelect";
import styles from "./ScheduleList.module.scss";
import { RootState, AppDispatch } from "../../store/store";
import { addEvent, clearSelectedSlots } from "../../store/calendarSlice";
import dayjs from "dayjs";

interface ScheduleItem {
  id: string;
  title: string;
  address: string;
  category: "restaurant" | "hotel" | "tourist_spot";
}

const ScheduleListItem: React.FC<{ item: ScheduleItem }> = React.memo(
  ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();
    const selectedSlots = useSelector(
      (s: RootState) => s.calendar.selectedSlots
    );
    const selectedCalendarSchedule = useSelector(
      (s: RootState) => s.calendar.selectedCalendarSchedule
    );

    const handleClick = useCallback(() => {
      if (selectedSlots.length === 0) {
        alert("먼저 달력에서 시간을 하나 이상 선택하세요.");
        return;
      }
      const newEvents = selectedSlots.map((slot) => {
        const start = dayjs(slot);
        return {
          id: Date.now().toString() + Math.random(),
          title: item.title,
          start: start.toISOString(),
          end: start.add(1, "hour").toISOString(),
          schedule: selectedCalendarSchedule.value,
          category: item.category,
        };
      });
      newEvents.forEach((ev) => dispatch(addEvent(ev)));
      dispatch(clearSelectedSlots());
    }, [dispatch, item, selectedSlots, selectedCalendarSchedule]);

    return (
      <div className={styles.main} onClick={handleClick}>
        <div className={styles.overlay}></div>
        <div className={styles.list_img}></div>
        <div className={styles.list_content}>
          <p className={styles.content_title}>{item.title}</p>
          <p className={styles.content_address}>{item.address}</p>
        </div>
      </div>
    );
  }
);

export const ScheduleList: React.FC = () => {
  const token = localStorage.getItem("accessToken");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedListSchedule = useSelector(
    (s: RootState) => s.calendar.selectedListSchedule
  );

  const scheduleItems: ScheduleItem[] = [
    {
      id: "item1",
      title: "만석 닭강정",
      address: "강원 속초시 청초호반로 72",
      category: "restaurant",
    },
    // … 추가 아이템
  ];

  const handleFetchTouristSpots = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const category = selectedListSchedule.value;

      if (category == "restaurant") {
        const res = await fetch(`https://localhost:8080/places/restaurants`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.success) {
          alert("맛집 조회가 성공적으로 되었습니다!");
        } else {
          alert("맛집 조회 실패: " + result.message);
        }
      } else if (category == "hotel") {
        const res = await fetch(
          `https://localhost:8080/places/accommodations`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (res.ok && result.success) {
          alert("숙소 조회가 성공적으로 되었습니다!");
        } else {
          alert("숙소 조회 실패: " + result.message);
        }
      } else if (category == "tourist_spot") {
        const res = await fetch(`https://localhost:8080/places/touristspots`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.success) {
          alert("관광지 조회가 성공적으로 되었습니다!");
        } else {
          alert("관광지 조회 실패: " + result.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.top}>
        <div className={styles.top_left}>
          <div className={styles.select_div}>
            <UseReactSelect type="list" />
          </div>
          <div className={styles.search_div}>
            <input type="text" />
            <div onClick={handleFetchTouristSpots}></div>
          </div>
        </div>
        <div className={styles.list_change}>
          <div className={styles.list_change_left_arrow}></div>
          <div className={styles.list_change_right_arrow}></div>
        </div>
      </div>
      <div className={styles.main_list}>
        {scheduleItems.map((item) => (
          <ScheduleListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
