'use client';

import UseReactSelect from '../select/UseReactSelect';
import styles from './ScheduleList.module.scss';

const ScheduleList = () => {
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
        <div className={styles.main}>
          <div className={styles.list_img}></div>
          <div className={styles.list_content}>
            <p className={styles.content_title}>만석 닭강정</p>
            <p className={styles.content_address}>강원 속초시 청초호반로 72</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
