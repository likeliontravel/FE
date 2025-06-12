// components/schedule/ScheduleList.tsx
'use client';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UseReactSelect from '../select/UseReactSelect';
import styles from './ScheduleList.module.scss';
import { RootState, AppDispatch } from '../../store/store';
import { addEvent, clearSelectedSlots } from '../../store/calendarSlice';
import dayjs from 'dayjs';

interface ScheduleItem {
  id: string;
  title: string;
  address: string;
  category: 'restaurant' | 'hotel' | 'tourist_spot';
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
        alert('먼저 달력에서 시간을 하나 이상 선택하세요.');
        return;
      }
      const newEvents = selectedSlots.map((slot) => {
        const start = dayjs(slot);
        return {
          id: Date.now().toString() + Math.random(),
          title: item.title,
          start: start.toISOString(),
          end: start.add(1, 'hour').toISOString(),
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
  const scheduleItems: ScheduleItem[] = [
    {
      id: 'item1',
      title: '만석 닭강정',
      address: '강원 속초시 청초호반로 72',
      category: 'restaurant',
    },
    // … 추가 아이템
  ];

  return (
    <div className={styles.body}>
      <div className={styles.top}>
        <div className={styles.top_left}>
          <div className={styles.select_div}>
            <UseReactSelect type="list" />
          </div>
          <div className={styles.search_div}>
            <input type="text" />
            <div></div>
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
