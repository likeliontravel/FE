"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchScheduleDetails,
  setEvents,
  updateScheduleDetail,
  deleteScheduleDetailAll,
  ScheduleDetailBody,
} from "../../util/schedule/scheduleSlice";
import dayjs from "dayjs";
import styles from "./ScheduleModal.module.scss";

export default function ScheduleModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();

  // URL에서 현재 groupName 읽어오기
  const params = useParams();
  const groupName = params?.groupName as string;

  // 리덕스에서 전체 세부 일정 리스트 및 현재 스케줄 ID 가져오기
  const { events, currentScheduleId, loading } = useSelector(
    (state: RootState) => state.schedule,
  );

  // 현재 그룹 페이지에 해당하는 세부 일정(장소)들만 필터링
  const currentDetails = useMemo(() => {
    if (!groupName) return [];

    return events
      .filter((event) => event.schedule === groupName)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [events, groupName]);

  // 체크박스 선택된 세부 일정 ID들을 관리할 상태
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 모달이 열릴 때 이 그룹의 세부 일정 데이터를 서버에서 최신화
  useEffect(() => {
    if (groupName) {
      dispatch(fetchScheduleDetails(groupName));
    }
  }, [dispatch, groupName]);

  // 개별 체크박스 토글
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  // 전체 선택 / 해제 토글
  const handleToggleAll = useCallback(() => {
    if (selectedIds.length === currentDetails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentDetails.map((item) => item.id));
    }
  }, [selectedIds, currentDetails]);

  // 삭제 후 남은 일정들을 백엔드 규격에 맞게 재정렬 및 매핑하는 함수
  const syncWithBackend = async (remainingEvents: typeof events) => {
    if (!currentScheduleId) {
      alert("스케줄 ID를 찾을 수 없습니다.");
      return;
    }

    // 시간 순으로 정렬 후 dayOrder, orderInDay 재계산 (WeekCalendar 로직 적용)
    const sortedEvents = [...remainingEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    let currentDayStr = "";
    let dayOrder = 0;
    let orderInDay = 0;

    const body: ScheduleDetailBody[] = sortedEvents.map((event) => {
      const startDay = dayjs(event.start).format("YYYY-MM-DD");
      if (startDay !== currentDayStr) {
        currentDayStr = startDay;
        dayOrder += 1;
        orderInDay = 1;
      } else {
        orderInDay += 1;
      }

      const isNewEvent = isNaN(Number(event.id));
      return {
        schedulePlaceId: isNewEvent ? null : Number(event.id),
        contentId: event.contentId || "",
        placeType: event.category || "TOURISTSPOT",
        visitStart: dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss"),
        visitedEnd: dayjs(
          event.end || dayjs(event.start).add(1, "hour"),
        ).format("YYYY-MM-DDTHH:mm:ss"),
        dayOrder: dayOrder,
        orderInDay: orderInDay,
      };
    });

    // 백엔드 일괄 수정 API 호출로 삭제 유도
    const actionResult = await dispatch(
      updateScheduleDetail({ scheduleId: currentScheduleId, body }),
    );

    if (updateScheduleDetail.fulfilled.match(actionResult)) {
      // 서버 저장 성공 시 리덕스 상태 업데이트 및 체크박스 비우기
      dispatch(setEvents(remainingEvents));
      setSelectedIds([]);
      alert("변경 사항이 성공적으로 반영되었습니다!");
      window.location.reload();
    } else {
      alert(`삭제 반영 실패: ${actionResult.payload}`);
    }
  };

  // 선택된 세부 일정들 일괄 삭제 기능
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (
      confirm(
        `선택한 ${selectedIds.length}개의 세부 일정을 일괄 삭제하시겠습니까?`,
      )
    ) {
      // 전체 이벤트 중 선택되지 않은(삭제 안 될) 이벤트들만 필터링
      const remainingEvents = events.filter((e) => !selectedIds.includes(e.id));
      await syncWithBackend(remainingEvents);
    }
  };

  // 전체 세부 일정 삭제 기능
  const handleDeleteAll = async () => {
    if (currentDetails.length === 0) {
      alert("삭제할 세부 일정이 없습니다.");
      return;
    }

    if (
      confirm(
        "이 그룹의 모든 세부 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      if (!currentScheduleId) {
        alert("스케줄 ID를 찾을 수 없습니다.");
        return;
      }

      const actionResult = await dispatch(
        deleteScheduleDetailAll(currentScheduleId),
      );

      if (deleteScheduleDetailAll.fulfilled.match(actionResult)) {
        setSelectedIds([]);
        alert("모든 세부 일정이 깔끔하게 삭제되었습니다!");
        window.location.reload();
      } else {
        alert(`전체 삭제 반영 실패: ${actionResult.payload}`);
      }
    }
  };

  // 배지 컬러 매핑 헬퍼
  const getBadgeColor = (category?: string) => {
    switch (category) {
      case "RESTAURANT":
        return "#FF5F92";
      case "ACCOMMODATION":
        return "#C6EE6A";
      case "TOURISTSPOT":
        return "#6FC6F4";
      default:
        return "#e2e8f0";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>그룹 세부 일정 관리</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 상단 컨트롤 영역 */}
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <input
              type="checkbox"
              id="allCheck"
              disabled={currentDetails.length === 0}
              checked={
                currentDetails.length > 0 &&
                selectedIds.length === currentDetails.length
              }
              onChange={handleToggleAll}
            />
            <label htmlFor="allCheck">전체 선택</label>
          </div>

          <div className={styles.rightActions}>
            <button
              className={styles.deleteSelected}
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
            >
              선택 일괄 삭제 ({selectedIds.length})
            </button>
            <button
              className={styles.deleteAll}
              onClick={handleDeleteAll}
              disabled={currentDetails.length === 0}
            >
              전체 삭제
            </button>
          </div>
        </div>

        {/* 세부 일정 목록 리스트 */}
        <div className={styles.list}>
          {loading && (
            <div className={styles.loading}>
              세부 일정을 불러오는 중입니다...
            </div>
          )}

          {!loading && currentDetails.length === 0 && (
            <div className={styles.empty}>
              이 그룹에 등록된 세부 일정이 없습니다.
            </div>
          )}

          {!loading &&
            currentDetails.map((item) => (
              <div key={item.id} className={styles.item}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                />

                <div
                  className={styles.badge}
                  style={{
                    backgroundColor: getBadgeColor(item.category),
                    color:
                      item.category === "ACCOMMODATION" ? "#5e0e0e" : "#fff",
                  }}
                >
                  {item.category === "RESTAURANT" && "맛집"}
                  {item.category === "ACCOMMODATION" && "숙소"}
                  {item.category === "TOURISTSPOT" && "관광지"}
                  {!item.category && "미정"}
                </div>

                <span className={styles.title}>{item.title}</span>
                <span className={styles.time}>
                  {item.start ? dayjs(item.start).format("MM/DD HH:mm") : ""}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
