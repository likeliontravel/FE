"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setMainViewDate,
  createSchedule,
} from "../../util/schedule/scheduleSlice";
import { useMemo, useState } from "react";
import ScheduleModal from "./ScheduleModal";
import styles from "./ScheduleCheck.module.scss";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface ScheduleCheckProps {
  schedule?: any[];
  groups?: any[];
  groupName?: string;
}

const ScheduleCheck = ({
  schedule = [] as any[],
  groups = [] as any[],
  groupName,
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
  const currentScheduleInfo = schedule.find((opt) => opt.value === groupName);

  const tripDays = useMemo(() => {
    if (
      !currentScheduleInfo?.startSchedule ||
      !currentScheduleInfo?.endSchedule
    )
      return [];

    const start = dayjs(currentScheduleInfo.startSchedule).startOf("day");
    const end = dayjs(currentScheduleInfo.endSchedule).startOf("day");
    const days = [];

    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, "day")) {
      days.push(curr);
      curr = curr.add(1, "day");
    }
    return days;
  }, [currentScheduleInfo]);

  const viewDay = dayjs(mainViewDate);
  const displayMonth = viewDay.format("M월");
  const startOfMonthDay = viewDay.startOf("month").day();
  const displayWeek = Math.ceil((viewDay.date() + startOfMonthDay) / 7);

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start).toDateString();
    const selectedDate = new Date(mainViewDate).toDateString();
    return eventDate === selectedDate;
  });

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

  const hasCurrentGroupSchedule = schedule.some(
    (opt) => opt.value === groupName,
  );

  const isScheduleEmpty = groupName
    ? !hasCurrentGroupSchedule
    : schedule.filter((opt) => opt.value !== "default").length === 0;

  if (isScheduleEmpty) {
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

  const todayEvents = useMemo(() => {
    return events
      .filter((event) => dayjs(event.start).isSame(viewDay, "day"))
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [events, viewDay]);

  const currentGroup = groups.find((g) => g.groupName === groupName);

  let regionName = "미정";
  if (currentScheduleInfo?.label) {
    regionName = currentScheduleInfo.label.replace(" 여행", "");
  }

  const creatorName = currentGroup?.createdName || "방장";
  const extraMembersCount = currentGroup?.members
    ? currentGroup.members.length - 1
    : 0;

  const mergedSchedules = useMemo(() => {
    if (todayEvents.length === 0) return [];

    const getRegion = (addr?: string) => {
      if (!addr) return regionName;
      const parts = addr.trim().split(" ");
      return parts.length >= 2 ? parts[1] : parts[0];
    };

    const result = [];

    let currentBlock = {
      region: getRegion(todayEvents[0].address),
      start: dayjs(todayEvents[0].start),
      end: dayjs(
        todayEvents[0].end || dayjs(todayEvents[0].start).add(1, "hour"),
      ),
      ids: [todayEvents[0].id],
    };

    for (let i = 1; i < todayEvents.length; i++) {
      const ev = todayEvents[i];
      const evRegion = getRegion(ev.address);
      const evStart = dayjs(ev.start);
      const evEnd = dayjs(ev.end || dayjs(ev.start).add(1, "hour"));

      if (currentBlock.region === evRegion) {
        if (evEnd.isAfter(currentBlock.end)) {
          currentBlock.end = evEnd;
        }
        currentBlock.ids.push(ev.id);
      } else {
        result.push(currentBlock);
        currentBlock = {
          region: evRegion,
          start: evStart,
          end: evEnd,
          ids: [ev.id],
        };
      }
    }
    result.push(currentBlock);

    return result;
  }, [todayEvents, regionName]);

  return (
    <div className={styles.container}>
      {/* 상단 날짜 및 타이틀 */}
      <div className={styles.header}>
        <div className={styles.dateNav}>
          <div className={styles.deteWeek}>
            <span>{displayMonth}</span>
            <span>{displayWeek}주차</span>
          </div>
          <div className={styles.dateDay}>
            {tripDays.length > 0 ? (
              tripDays.map((day, idx) => {
                const isSelected = viewDay.isSame(day, "day");
                return (
                  <button
                    key={idx}
                    className={isSelected ? styles.date : ""}
                    onClick={() => handleDateClick(day.toDate())}
                  >
                    {day.format("D")}
                  </button>
                );
              })
            ) : (
              <button className={styles.date}>{viewDay.format("D")}</button>
            )}
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

      <div className={styles.summarySection}>
        {/* 왼쪽 정보 박스 */}
        <div className={styles.groupInfo}>
          <p>
            <i>{groupName}</i> 그룹과 <br />
            <i>{regionName}</i> 에서의 여정
          </p>
          <p className={styles.together}>
            {creatorName}님 외 {extraMembersCount > 0 ? extraMembersCount : 0}
            명이 함께해요
          </p>
          <div className={styles.schedule}>
            {mergedSchedules.length > 0 ? (
              mergedSchedules.map((block, idx) => (
                <div
                  key={block.ids.join("-")}
                  className={
                    idx % 2 === 0 ? styles.activeTime : styles.inactiveTime
                  }
                >
                  <span className={styles.location}>📍 {block.region}</span>
                  <span className={styles.scheduleTime}>
                    {block.start.format("HH:mm")}~{block.end.format("HH:mm")}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#888", marginTop: "10px" }}>
                등록된 세부 일정이 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* 오른쪽 카드 섹션 */}
        <div className={styles.cardSection}>
          {/* 맛집 */}
          <div className={styles.cardColumn}>
            <h3>맛집 🍜</h3>
            {dayEvents.filter((e) => e.category === "restaurant").length > 0 ? (
              dayEvents
                .filter((e) => e.category === "restaurant")
                .map((item) => (
                  <div key={item.id} className={styles.card}>
                    <img src={item.img} alt={item.title} />
                    <div className={styles.cardContent}>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.address}>{item.address}</p>
                      <p className={styles.time}>
                        🕒 {dayjs(item.start).format("HH:mm")} -{" "}
                        {dayjs(
                          item.end || dayjs(item.start).add(1, "hour"),
                        ).format("HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className={styles.noEvents}>일정 없음</p>
            )}
          </div>

          {/* 숙소 */}
          <div className={styles.cardColumn}>
            <h3>숙소 🏨</h3>
            {dayEvents.filter((e) => e.category === "hotel").length > 0 ? (
              dayEvents
                .filter((e) => e.category === "hotel")
                .map((item) => (
                  <div key={item.id} className={styles.card}>
                    <img
                      src={item.img || "/imgs/default_image.png"}
                      alt={item.title}
                    />
                    <div className={styles.cardContent}>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.address}>
                        {item.address || "주소 정보 없음"}
                      </p>
                      <p className={styles.time}>
                        🕒 {dayjs(item.start).format("HH:mm")} -{" "}
                        {dayjs(
                          item.end || dayjs(item.start).add(1, "hour"),
                        ).format("HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className={styles.noEvents}>일정 없음</p>
            )}
          </div>

          {/* 관광지 */}
          <div className={styles.cardColumn}>
            <h3>관광지 🎄</h3>
            {dayEvents.filter((e) => e.category === "tourist_spot").length >
            0 ? (
              dayEvents
                .filter((e) => e.category === "tourist_spot")
                .map((item) => (
                  <div key={item.id} className={styles.card}>
                    <img
                      src={item.img || "/imgs/default_image.png"}
                      alt={item.title}
                    />
                    <div className={styles.cardContent}>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.address}>
                        {item.address || "주소 정보 없음"}
                      </p>
                      <p className={styles.time}>
                        🕒 {dayjs(item.start).format("HH:mm")} -{" "}
                        {dayjs(
                          item.end || dayjs(item.start).add(1, "hour"),
                        ).format("HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className={styles.noEvents}>일정 없음</p>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ScheduleCheck;
