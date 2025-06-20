'use client';

import { useState } from 'react';
import styles from './ScheduleCheck.module.scss';

const ScheduleCheck = () => {
  return (
    <div className={styles.container}>
      {/* 상단 날짜 및 타이틀 */}
      <div className={styles.header}>
        <div className={styles.dateNav}>
          <span>12월</span>
          <span>2주차</span>
          <button className={styles.date}>27</button>
          <button className={styles.date}>28</button>
          <button className={styles.date}>29</button>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn}>🛠 일정 관리</button>
          <button className={styles.btn}>📅 타임테이블</button>
        </div>
      </div>

      {/* 왼쪽 정보 박스 */}
      <div className={styles.summarySection}>
        <div className={styles.groupInfo}>
          <p>
            <i>멋사</i> 그룹과 <br />
            <i>속초</i> 에서의 여정
          </p>
          <div className={styles.people}>
            <div className={styles.profile}></div>
            <p>린님 외 3명이 함께해요</p>
          </div>
          <div className={styles.schedule}>
            <div className={styles.activeTime}>
              <span className={styles.location}>📍 속초</span>
              <span className={styles.time}>14:00~17:00</span>
            </div>
            <div className={styles.inactiveTime}>
              <span>📍 속초</span>
              <span>14:00~17:00</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 카드 섹션 */}
        <div className={styles.cardSection}>
          {/* 맛집 */}
          <div className={styles.cardColumn}>
            <h3>맛집 🍜</h3>
            <div className={styles.card}>
              <img src="/img1.jpg" alt="만석 닭강정" />
              <div className={styles.cardContent}>
                <p className={styles.title}>만석 닭강정</p>
                <p className={styles.address}>강원 속초시 청초호반로 72</p>
                <p className={styles.time}>🕒 매일 10:00 - 20:00</p>
              </div>
            </div>
            <div className={styles.card}>
              <img src="/img2.jpg" alt="좋다게" />
              <div className={styles.cardContent}>
                <p className={styles.title}>좋다게</p>
                <p className={styles.address}>강원 속초시 대표항1명1 75</p>
                <p className={styles.time}>🕒 매일 10:00 - 02:00</p>
              </div>
            </div>
          </div>

          {/* 숙소 */}
          <div className={styles.cardColumn}>
            <h3>숙소 🏨</h3>
            <div className={styles.card}>
              <img src="/img3.jpg" alt="체스터톤스 속초" />
              <div className={styles.cardContent}>
                <p className={styles.title}>체스터톤스 속초</p>
                <p className={styles.address}>강원 속초시 엑스포로 109</p>
                <p className={styles.time}>🕒 매일 10:00 - 20:00</p>
              </div>
            </div>
          </div>

          {/* 관광지 */}
          <div className={styles.cardColumn}>
            <h3>관광지 🎄</h3>
            <div className={styles.card}>
              <img src="/img4.jpg" alt="속초아이대관람차" />
              <div className={styles.cardContent}>
                <p className={styles.title}>속초아이대관람차</p>
                <p className={styles.address}>속초시 청호해안길 2</p>
                <p className={styles.time}>🕒 매일 10:00 - 20:00</p>
              </div>
            </div>
            <div className={styles.card}>
              <img src="/img5.jpg" alt="속초관광수산시장" />
              <div className={styles.cardContent}>
                <p className={styles.title}>속초관광수산시장</p>
                <p className={styles.address}>중앙로147번길 12</p>
                <p className={styles.time}>🕒 매일 08:00 - 24:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCheck;
