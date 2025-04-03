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
        <div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className={styles.main}>
        <div>
          <div></div>
          <div>
            <p></p>
            <p></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
