'use client';

import React, { useCallback } from 'react';
import UseReactSelect from '../select/UseReactSelect';
import styles from './ScheduleList.module.scss';

// 1. ScheduleItem 타입 정의
interface ScheduleItem {
  id: string;
  title: string;
  address: string;
}

// 2. ScheduleList 컴포넌트의 props 타입 정의
interface ScheduleListProps {
  onScheduleItemClick: (item: ScheduleItem) => void;
}

// 3. 각 항목을 렌더링하는 별도 컴포넌트 생성 (React.memo를 사용하여 불필요한 리렌더링 방지)
const ScheduleListItem: React.FC<{
  item: ScheduleItem;
  onScheduleItemClick: (item: ScheduleItem) => void;
}> = React.memo(({ item, onScheduleItemClick }) => {
  const handleClick = useCallback(() => {
    onScheduleItemClick(item);
  }, [onScheduleItemClick, item]);

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
});

const ScheduleList: React.FC<ScheduleListProps> = ({ onScheduleItemClick }) => {
  // 예시 scheduleItems 배열 - 실제 데이터에 맞게 확장 가능
  const scheduleItems: ScheduleItem[] = [
    {
      id: 'item1',
      title: '만석 닭강정',
      address: '강원 속초시 청초호반로 72',
    },
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
          <ScheduleListItem
            key={item.id}
            item={item}
            onScheduleItemClick={onScheduleItemClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
