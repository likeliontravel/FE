"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UseReactSelect from "../../select/UseReactSelect";
import styles from "./ScheduleList.module.scss";
import { RootState, AppDispatch } from "../../../store/store";
import { addEvent, clearSelectedSlots } from "../../../store/calendarSlice";
import dayjs from "dayjs";
import {
  clearScheduleItems,
  fetchScheduleItems,
  ScheduleItem,
} from "../scheduleSlice";

interface ScheduleListProps {
  selectedLocation: string;
  selectedTheme: string;
}

const ScheduleListItem: React.FC<{ item: ScheduleItem }> = React.memo(
  ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();
    const selectedSlots = useSelector(
      (s: RootState) => s.calendar.selectedSlots,
    );
    const selectedCalendarSchedule = useSelector(
      (s: RootState) => s.calendar.selectedCalendarSchedule,
    );

    const handleClick = useCallback(() => {
      if (selectedSlots.length === 0) {
        alert("먼저 달력에서 시간을 하나 이상 선택하세요.");
        return;
      }
      const newEvents = selectedSlots.map((slot) => {
        const start = dayjs(slot);
        return {
          id: item.contentId,
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

    const imgSrc = item.imageUrl || item.thumbnailImageUrl;

    return (
      <div className={styles.main} onClick={handleClick}>
        <div className={styles.overlay}></div>
        <div
          className={styles.list_img}
          style={{
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div className={styles.list_content}>
          <p className={styles.content_title}>{item.title}</p>
          <p className={styles.content_address}>{item.address}</p>
        </div>
      </div>
    );
  },
);

export const ScheduleList: React.FC<ScheduleListProps> = ({
  selectedLocation,
  selectedTheme,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedListSchedule = useSelector(
    (s: RootState) => s.calendar.selectedListSchedule,
  );

  const { scheduleItems, loading, error } = useSelector(
    (state: RootState) => state.schedule,
  );
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [apiPage, setApiPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;
  useEffect(() => {
    return () => {
      dispatch(clearScheduleItems());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleFetchTouristSpots = async () => {
    if (loading) return;

    dispatch(
      fetchScheduleItems({
        category: selectedListSchedule.value, // "restaurant", "hotel", "tourist_spot"
        location: selectedLocation,
        theme: selectedTheme,
        keyword: keyword,
        page: 1,
      }),
    ).then((action) => {
      if (fetchScheduleItems.fulfilled.match(action)) {
        alert("데이터 조회가 성공적으로 되었습니다!");
        setCurrentPage(0);
        if (action.payload.items.length < 30) {
          setHasMore(false);
        }
      }
    });
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (loading) return;

    const maxPage = Math.ceil(scheduleItems.length / ITEMS_PER_PAGE) - 1;

    if (currentPage < maxPage) {
      setCurrentPage((prev) => prev + 1);
    } else if (hasMore) {
      const nextApiPage = apiPage + 1;

      dispatch(
        fetchScheduleItems({
          category: selectedListSchedule.value,
          location: selectedLocation,
          theme: selectedTheme,
          keyword: keyword,
          page: nextApiPage,
        }),
      ).then((action) => {
        if (fetchScheduleItems.fulfilled.match(action)) {
          setApiPage(nextApiPage);
          setCurrentPage((prev) => prev + 1);

          if (action.payload.items.length < 30) {
            setHasMore(false);
          }
        }
      });
    }
  };

  const currentItems = scheduleItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <div className={styles.body}>
      <div className={styles.top}>
        <div className={styles.top_left}>
          <div className={styles.select_div}>
            <UseReactSelect type="list" />
          </div>
          <div className={styles.search_div}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div onClick={handleFetchTouristSpots}></div>
          </div>
        </div>
        <div className={styles.list_change}>
          <div
            onClick={handlePrev}
            className={styles.list_change_left_arrow}
          ></div>
          <div
            onClick={handleNext}
            className={styles.list_change_right_arrow}
          ></div>
        </div>
      </div>
      <div className={styles.main_list}>
        {!loading && scheduleItems.length === 0 && (
          <div className={styles.empty}>검색 결과가 없습니다.</div>
        )}
        {currentItems.map((item: ScheduleItem) => (
          <ScheduleListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
