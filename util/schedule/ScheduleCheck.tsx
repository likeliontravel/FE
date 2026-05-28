"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setMainViewDate,
  createSchedule,
} from "../../util/schedule/scheduleSlice";
import { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import styles from "./ScheduleCheck.module.scss";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface ScheduleCheckProps {
  schedule?: any[];
  groups?: any[];
}

const ScheduleCheck = ({
  schedule = [] as any[],
  groups = [] as any[],
}: ScheduleCheckProps) => {
  const route = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const mainViewDate = useSelector(
    (state: RootState) => state.schedule.mainViewDate,
  );

  const handleDateClick = (date: Date) => {
    dispatch(setMainViewDate(date));
  };

  const events = useSelector((state: RootState) => state.schedule.events);

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start).toDateString();
    const selectedDate = new Date(mainViewDate).toDateString();
    return eventDate === selectedDate;
  });

  const categories = ["restaurant", "hotel", "tourist_spot"] as const;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalData, setModalData] = useState({
    groupName: "",
    startSchedule: "",
    endSchedule: "",
  });

  const handleCreateScheduleSubmit = async () => {
    if (
      !modalData.groupName ||
      !modalData.startSchedule ||
      !modalData.endSchedule
    ) {
      alert("그룹, 시작일, 종료일을 모두 선택해주세요.");
      return;
    }

    const payload = {
      groupName: modalData.groupName,
      startSchedule: dayjs(modalData.startSchedule).format(
        "YYYY-MM-DDTHH:mm:ss",
      ),
      endSchedule: dayjs(modalData.endSchedule).format("YYYY-MM-DDTHH:mm:ss"),
    };

    dispatch(createSchedule(payload)).then((action) => {
      if (createSchedule.fulfilled.match(action)) {
        alert("일정이 성공적으로 생성되었습니다!");
        setShowCreateModal(false);
        route.push("/schedule");
      } else {
        alert(`일정 생성 실패: ${action.payload}`);
      }
    });
  };

  if (!Array.isArray(schedule) || schedule.length === 0) {
    return (
      <>
        <div className={styles.blurContainer}>
          <div className={styles.blurTextWrapper}>
            <p className={styles.blurText}>아직 그룹일정이 존재하지 않아요!</p>
            <p className={styles.blurText_2}>
              일정을 만들면 이곳에 일정이 표시돼요!
            </p>
            <h4
              className={styles.blurText_3}
              onClick={() => setShowCreateModal(true)}
            >
              새로운 일정 만들기
            </h4>
          </div>
          <img src="/imgs/blur_schedule.png" alt="blur" />
        </div>

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>일정 생성</h2>

              <div style={{ marginBottom: "15px" }}>
                <label>그룹 선택</label>
                <select
                  value={modalData.groupName}
                  onChange={(e) =>
                    setModalData({ ...modalData, groupName: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="">그룹을 선택하세요</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.groupName}>
                      {g.groupName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>시작 날짜/시간</label>
                <input
                  type="datetime-local"
                  value={modalData.startSchedule}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      startSchedule: e.target.value,
                    })
                  }
                  className={styles.input}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>종료 날짜/시간</label>
                <input
                  type="datetime-local"
                  value={modalData.endSchedule}
                  onChange={(e) =>
                    setModalData({ ...modalData, endSchedule: e.target.value })
                  }
                  className={styles.input}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelBtn}
                >
                  취소
                </button>
                <button
                  onClick={handleCreateScheduleSubmit}
                  className={styles.submitBtn}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.container}>
      {/* 상단 날짜 및 타이틀 */}
      <div className={styles.header}>
        <div className={styles.dateNav}>
          <div className={styles.deteWeek}>
            <span>12월</span>
            <span>2주차</span>
          </div>
          <div className={styles.dateDay}>
            <button className={styles.date}>27</button>
            <button className={styles.date}>28</button>
            <button className={styles.date}>29</button>
          </div>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => setIsModalOpen(true)}>
            🛠 일정 관리
          </button>
          <Link href={"/schedule"}>
            <button className={styles.btn}>📅 타임테이블</button>
          </Link>
        </div>
      </div>

      {/* 왼쪽 정보 박스 */}
      <div className={styles.summarySection}>
        <div className={styles.groupInfo}>
          <p>
            <i>멋사</i> 그룹과 <br />
            <i>속초</i> 에서의 여정
          </p>
          <p className={styles.together}>린님 외 3명이 함께해요</p>
          <div className={styles.schedule}>
            <div className={styles.activeTime}>
              <span className={styles.location}>📍 속초</span>
              <span className={styles.scheduleTime}>14:00~17:00</span>
            </div>
            <div className={styles.inactiveTime}>
              <span className={styles.location}>📍 속초</span>
              <span className={styles.scheduleTime}>14:00~17:00</span>
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
      {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ScheduleCheck;
