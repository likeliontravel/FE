"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setMainViewDate,
  createSchedule,
  deleteSchedule,
} from "../../util/schedule/scheduleSlice";
import { useEffect, useMemo, useState } from "react";
import ScheduleModal from "./ScheduleModal";
import styles from "./ScheduleCheck.module.scss";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const REGION_COLORS = [
  "#FFD1DC",
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#C7CEEA",
  "#E2F0CB",
  "#F3B0C3",
  "#C6DBDA",
  "#FEE1E8",
  "#FED7C3",
  "#F6EAC2",
  "#ECD5E3",
  "#D4F0F0",
  "#8FCACA",
  "#CCE2CB",
  "#B6CFB6",
  "#97C1A9",
  "#FCB9AA",
  "#FFDBCC",
  "#ECEAE4",
  "#A2E1DB",
  "#55CBCD",
  "#FFC4C4",
  "#FFDAB9",
  "#E6E6FA",
  "#D8BFD8",
  "#F08080",
  "#FFF0F5",
  "#E0FFFF",
  "#F0FFF0",
  "#F5F5DC",
  "#FFE4E1",
  "#FFFACD",
  "#E6E6FA",
];

const getRegionColor = (region: string) => {
  let hash = 0;
  for (let i = 0; i < region.length; i++) {
    hash = region.charCodeAt(i) + ((hash << 5) - hash);
  }
  return REGION_COLORS[(Math.abs(hash) % 997) % REGION_COLORS.length];
};

interface ScheduleCheckProps {
  groupName?: string;
}

const ScheduleCheck = ({ groupName }: ScheduleCheckProps) => {
  const route = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { mainViewDate, currentScheduleId } = useSelector(
    (state: RootState) => state.schedule,
  );
  const { groupDetail, groups } = useSelector(
    (state: RootState) => state.group,
  );

  const handleDateClick = (dateStr: string) => {
    dispatch(setMainViewDate(dateStr));
  };

  const currentSchedule = groupDetail?.schedule;
  const startSchedule = currentSchedule?.startSchedule;
  const endSchedule = currentSchedule?.endSchedule;

  useEffect(() => {
    if (startSchedule) {
      dispatch(setMainViewDate(startSchedule));
    }
  }, [startSchedule, dispatch]);

  const events = useMemo(() => {
    if (!currentSchedule?.places) return [];
    return currentSchedule.places.map((place) => {
      return {
        id: place.contentId,
        title: place.title,
        start: place.visitStart,
        end: place.visitedEnd,
        category: place.placeType,
        img: place.img,
        address: place.address,
      };
    });
  }, [currentSchedule]);

  const tripDays = useMemo(() => {
    if (!startSchedule || !endSchedule) return [];

    const start = dayjs(startSchedule).startOf("day");
    const end = dayjs(endSchedule).startOf("day");
    const days = [];

    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, "day")) {
      days.push(curr);
      curr = curr.add(1, "day");
    }
    return days;
  }, [startSchedule, endSchedule]);

  const viewDay = dayjs(mainViewDate);
  const displayMonth = viewDay.format("M월");
  const startOfMonthDay = viewDay.startOf("month").day();
  const displayWeek = Math.ceil((viewDay.date() + startOfMonthDay) / 7);

  const dayEvents = useMemo(() => {
    const currentViewDay = dayjs(mainViewDate);
    const filtered = events.filter((event) =>
      event.start ? dayjs(event.start).isSame(currentViewDay, "day") : false,
    );

    const sorted = filtered.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    const mergedEvents: typeof sorted = [];

    for (const ev of sorted) {
      if (mergedEvents.length === 0) {
        mergedEvents.push({ ...ev });
        continue;
      }

      const lastEv = mergedEvents[mergedEvents.length - 1];

      if (lastEv.title === ev.title) {
        const lastEnd = dayjs(lastEv.end || dayjs(lastEv.start).add(1, "hour"));
        const currEnd = dayjs(ev.end || dayjs(ev.start).add(1, "hour"));

        if (currEnd.isAfter(lastEnd)) {
          lastEv.end = currEnd.format("YYYY-MM-DDTHH:mm:ss");
        }
      } else {
        mergedEvents.push({ ...ev });
      }
    }

    return mergedEvents;
  }, [events, viewDay]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteScheduleClick = async () => {
    if (!currentScheduleId) {
      alert("삭제할 일정 ID를 찾을 수 없습니다.");
      return;
    }

    if (
      confirm(
        "이 그룹의 전체 일정을 삭제하시겠습니까?\n내부 세부 일정을 포함한 모든 데이터가 삭제되며 되돌릴 수 없습니다.",
      )
    ) {
      // 전체 삭제 /schedule/{scheduleId} 호출!
      const actionResult = await dispatch(deleteSchedule(currentScheduleId));

      if (deleteSchedule.fulfilled.match(actionResult)) {
        alert("그룹 일정이 성공적으로 완전히 삭제되었습니다!");
        window.location.reload();
      } else {
        alert(`일정 삭제 실패: ${actionResult.payload}`);
      }
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalData, setModalData] = useState({
    groupName: groupName,
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

  const isScheduleEmpty = !currentSchedule;

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

  const regionName = useMemo(() => {
    if (!events || events.length === 0) return "미정";

    const firstPlaceWithAddress = events.find((place) => place.address);

    if (firstPlaceWithAddress) {
      const parts = firstPlaceWithAddress.address.trim().split(" ");
      return parts.length >= 2 ? parts[1] : parts[0];
    }

    return "미정";
  }, [events]);

  const creatorName = groupDetail?.createdName || "방장";
  const extraMembersCount = groupDetail?.members
    ? groupDetail.members.length - 1
    : 0;

  const mergedSchedules = useMemo(() => {
    if (dayEvents.length === 0) return [];

    const getRegion = (addr?: string) => {
      if (!addr) return regionName;
      const parts = addr.trim().split(" ");
      return parts.length >= 2 ? parts[1] : parts[0];
    };

    const result = [];

    let currentBlock = {
      region: getRegion(dayEvents[0].address),
      start: dayjs(dayEvents[0].start),
      end: dayjs(dayEvents[0].end || dayjs(dayEvents[0].start).add(1, "hour")),
      ids: [dayEvents[0].id],
    };

    for (let i = 1; i < dayEvents.length; i++) {
      const ev = dayEvents[i];
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
  }, [dayEvents, regionName]);

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
                    onClick={() =>
                      handleDateClick(day.format("YYYY-MM-DDTHH:mm:ss"))
                    }
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
            🛠 일정 수정
          </button>
          <button
            className={`${styles.btn} ${styles.deleteBtn}`}
            onClick={handleDeleteScheduleClick}
          >
            🗑️ 일정 삭제
          </button>
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
                  key={`${block.ids.join("-")}-${idx}`}
                  className={styles.activeTime}
                  style={{ backgroundColor: getRegionColor(block.region) }}
                >
                  <span className={styles.location}>{block.region}</span>
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
            {dayEvents.filter((e) => e.category === "RESTAURANT").length > 0 ? (
              dayEvents
                .filter((e) => e.category === "RESTAURANT")
                .map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={styles.card}>
                    <img
                      src={item.img || "/imgs/character.png"}
                      alt={item.title}
                    />
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
            {dayEvents.filter((e) => e.category === "ACCOMMODATION").length >
            0 ? (
              dayEvents
                .filter((e) => e.category === "ACCOMMODATION")
                .map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={styles.card}>
                    <img
                      src={item.img || "/imgs/character.png"}
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
            {dayEvents.filter((e) => e.category === "TOURISTSPOT").length >
            0 ? (
              dayEvents
                .filter((e) => e.category === "TOURISTSPOT")
                .map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={styles.card}>
                    <img
                      src={item.img || "/imgs/character.png"}
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
