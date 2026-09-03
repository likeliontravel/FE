"use client";

import Script from "next/script";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { RootState } from "../../store/store";
import { CalendarEvent } from "../schedule/scheduleSlice";
import { useSelector } from "react-redux";
import styles from "./KakaoMap.module.scss";
import dayjs from "dayjs";

declare global {
  interface Window {
    kakao: any;
  }
}

// ISO 날짜 문자열을 보기 좋게 포맷팅해주는 함수
const formatTimeRange = (startStr?: string, endStr?: string) => {
  if (!startStr) return "";
  const start = dayjs(startStr);
  if (!start.isValid()) return `${startStr} ${endStr ? `~ ${endStr}` : ""}`;

  const formattedStart = start.format("YYYY.MM.DD HH:mm");

  if (!endStr) return formattedStart;

  const end = dayjs(endStr);
  if (!end.isValid()) return `${formattedStart} ~ ${endStr}`;

  // 시작일과 종료일이 같은 날짜면 종료 시간은 HH:mm 만 표시
  if (start.isSame(end, "day")) {
    return `${formattedStart} ~ ${end.format("HH:mm")}`;
  }

  return `${formattedStart} ~ ${end.format("YYYY.MM.DD HH:mm")}`;
};

// 카테고리별 디자인 설정
const getCategoryStyle = (category?: string) => {
  switch (category) {
    case "RESTAURANT":
      return { bg: "#FF5A5F", icon: "🍽️", label: "맛집" };
    case "TOURISTSPOT":
      return { bg: "#10B981", icon: "🎡", label: "관광지" };
    case "ACCOMMODATION":
      return { bg: "#8B5CF6", icon: "🏨", label: "숙소" };
    default:
      return { bg: "#3B82F6", icon: "📍", label: "기본" };
  }
};

// 주소 정제 (도로명/지번 건물번호 뒤의 층, 호, 콤마 등 무조건 잘라냄)
const cleanAddress = (addr: string) => {
  if (!addr) return "";
  // 괄호 제거: (역삼동) -> 삭제
  const noParentheses = addr.replace(/\([^)]*\)/g, " ").trim();

  // 도로명/지번 건물번호까지만 자르기 (예: ~로 123, ~길 45-6)
  const match = noParentheses.match(
    /^(.*?(?:대로|로|길|동|리)\s*\d+(?:-\d+)?)/,
  );
  if (match) {
    return match[1].trim();
  }
  return noParentheses;
};

// 장소 제목 정제 (괄호 안의 영문명 제거: "강남스테이힐(Gangnam Stay Hill)" -> "강남스테이힐")
const cleanTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/\([^)]*\)/g, "").trim();
};

export default function KakaoMap() {
  const { events, selectedCalendarSchedule } = useSelector(
    (state: RootState) => state.schedule,
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const requestIdRef = useRef<number>(0);

  // 필터 상태 관리
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

  // 클릭된 장소 상태 관리
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  // 위치 검색 실패로 경로에서 제외된 장소 목록
  const [failedEvents, setFailedEvents] = useState<CalendarEvent[]>([]);

  // 현재 선택된 일정 내에서도 '여행 시작일 ~ 종료일' 범위 안에 있는 이벤트만 1차 추출
  const currentScheduleEvents = useMemo(() => {
    if (!events) return [];

    if (
      selectedCalendarSchedule?.value &&
      selectedCalendarSchedule.value !== "그룹명"
    ) {
      return events.filter((e) => {
        // 그룹명 일치 여부 확인
        const isSameGroup = e.schedule === selectedCalendarSchedule.value;

        // 여행 시작일(startSchedule) ~ 종료일(endSchedule) 범위 유효성 검사
        const { startSchedule, endSchedule } = selectedCalendarSchedule;
        if (startSchedule && endSchedule && e.start) {
          const eventDate = dayjs(e.start).format("YYYY-MM-DD");
          const startDate = dayjs(startSchedule).format("YYYY-MM-DD");
          const endDate = dayjs(endSchedule).format("YYYY-MM-DD");

          // 이벤트 날짜가 여행 기간 내에 들어오는지 확인
          const isWithinPeriod = eventDate >= startDate && eventDate <= endDate;

          return isSameGroup && isWithinPeriod;
        }

        return isSameGroup;
      });
    }

    return events;
  }, [events, selectedCalendarSchedule]);

  // 일정이 변경되면 필터 및 상세패널 초기화
  useEffect(() => {
    setSelectedDate("ALL");
    setSelectedRegion("ALL");
    setSelectedEvent(null);
  }, [selectedCalendarSchedule?.value, events]);

  // 1. 현재 일정 기반 유일한 날짜 목록 추출
  const dateList = useMemo(() => {
    if (!currentScheduleEvents) return [];
    const dates = Array.from(
      new Set(
        currentScheduleEvents
          .filter((e) => e.start)
          .map((e) => dayjs(e.start).format("YYYY-MM-DD")),
      ),
    ).sort();

    return dates.map((date, idx) => ({
      raw: date,
      label: `Day ${idx + 1} (${dayjs(date).format("MM.DD")})`,
    }));
  }, [currentScheduleEvents]);

  // currentScheduleEvents 기반 유일한 지역 목록 추출 (주소의 시/군/구)
  const regionList = useMemo(() => {
    if (!currentScheduleEvents) return [];
    const regions = new Set<string>();
    currentScheduleEvents.forEach((e) => {
      if (e.address) {
        const parts = e.address.split(" ");
        if (parts.length > 1) {
          regions.add(parts[1]); // 예: "강남구", "가평군"
        } else if (parts.length > 0) {
          regions.add(parts[0]);
        }
      }
    });
    return Array.from(regions).sort();
  }, [currentScheduleEvents]);

  // 날짜 및 지역 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    if (!currentScheduleEvents) return [];

    // 시간순(방문순) 정렬
    const sorted = [...currentScheduleEvents].sort((a, b) => {
      if (!a.start) return 1;
      if (!b.start) return -1;
      return dayjs(a.start).valueOf() - dayjs(b.start).valueOf();
    });

    return sorted.filter((e) => {
      const dateMatch =
        selectedDate === "ALL" ||
        (e.start && dayjs(e.start).format("YYYY-MM-DD") === selectedDate);

      const regionMatch =
        selectedRegion === "ALL" ||
        (e.address && e.address.includes(selectedRegion));

      return dateMatch && regionMatch;
    });
  }, [currentScheduleEvents, selectedDate, selectedRegion]);

  // 릴레이 검색(Waterfall) 스마트 로직
  const searchLocation = useCallback(
    (geocoder: any, places: any, event: CalendarEvent) => {
      return new Promise<{ coords: any; event: CalendarEvent } | null>(
        async (resolve) => {
          if (!event) return resolve(null);

          const region = event.address ? event.address.split(" ")[1] || "" : "";
          const cleanedAddr = cleanAddress(event.address || "");
          const cleanedTitle = cleanTitle(event.title || "");

          // 정제된 주소 검색
          if (cleanedAddr) {
            const res1 = await new Promise<any>((r) =>
              geocoder.addressSearch(cleanedAddr, (res: any, status: any) =>
                status === window.kakao.maps.services.Status.OK
                  ? r(res)
                  : r(null),
              ),
            );
            if (res1 && res1[0]) {
              return resolve({
                coords: new window.kakao.maps.LatLng(res1[0].y, res1[0].x),
                event,
              });
            }
          }

          // 주소로 키워드 검색
          if (cleanedAddr && places) {
            const res2 = await new Promise<any>((r) =>
              places.keywordSearch(cleanedAddr, (res: any, status: any) =>
                status === window.kakao.maps.services.Status.OK
                  ? r(res)
                  : r(null),
              ),
            );
            if (res2 && res2[0]) {
              return resolve({
                coords: new window.kakao.maps.LatLng(res2[0].y, res2[0].x),
                event,
              });
            }
          }

          // 장소명(Title) 키워드 검색
          if (cleanedTitle && places) {
            const res3 = await new Promise<any>((r) =>
              places.keywordSearch(cleanedTitle, (res: any, status: any) =>
                status === window.kakao.maps.services.Status.OK
                  ? r(res)
                  : r(null),
              ),
            );
            if (res3 && res3[0]) {
              return resolve({
                coords: new window.kakao.maps.LatLng(res3[0].y, res3[0].x),
                event,
              });
            }
          }

          // "지역명 + 장소명" 검색 (예: "강남구 강남스테이힐")
          if (region && cleanedTitle && places) {
            const res4 = await new Promise<any>((r) =>
              places.keywordSearch(
                `${region} ${cleanedTitle}`,
                (res: any, status: any) =>
                  status === window.kakao.maps.services.Status.OK
                    ? r(res)
                    : r(null),
              ),
            );
            if (res4 && res4[0]) {
              return resolve({
                coords: new window.kakao.maps.LatLng(res4[0].y, res4[0].x),
                event,
              });
            }
          }

          // 키워드 띄어쓰기 자동 변환 (예: "강남스테이힐" -> "강남 스테이힐")
          const spacedTitle = cleanedTitle.replace(
            /(강남|역삼|서초|홍대|신촌|성수)(.+)/,
            "$1 $2",
          );
          if (spacedTitle !== cleanedTitle && places) {
            const res5 = await new Promise<any>((r) =>
              places.keywordSearch(spacedTitle, (res: any, status: any) =>
                status === window.kakao.maps.services.Status.OK
                  ? r(res)
                  : r(null),
              ),
            );
            if (res5 && res5[0]) {
              return resolve({
                coords: new window.kakao.maps.LatLng(res5[0].y, res5[0].x),
                event,
              });
            }
          }

          console.warn(`[카카오맵] 최종 검색 실패: "${event.title}"`);
          resolve(null);
        },
      );
    },
    [],
  );

  // 마커 및 경로선(Polyline) 업데이트
  const updateMarkers = useCallback(() => {
    const map = kakaoMapRef.current;
    if (!map || !window.kakao?.maps?.services) return;

    const currentRequestId = ++requestIdRef.current;

    // 기존 오버레이 및 폴리라인 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    if (!filteredEvents || filteredEvents.length === 0) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    const places = new window.kakao.maps.services.Places();

    const searchPromises = filteredEvents.map((event) =>
      searchLocation(geocoder, places, event),
    );

    Promise.all(searchPromises).then((results) => {
      if (currentRequestId !== requestIdRef.current) return;

      const validResults = results.filter((r) => r !== null);
      const failed = filteredEvents.filter((_, idx) => results[idx] === null);

      setFailedEvents(failed);

      const linePath: any[] = [];

      validResults.forEach((item, realIndex) => {
        if (!item) return;
        const { coords, event } = item;
        linePath.push(coords);

        const style = getCategoryStyle(event.category);

        const pinContainer = document.createElement("div");
        pinContainer.className = "custom-pin-wrapper";
        pinContainer.style.setProperty("--pin-color", style.bg);

        pinContainer.innerHTML = `
          <div class="custom-pin-badge">
            <span style="font-weight: 800; color: ${style.bg};">${realIndex + 1}.</span>
            <span>${event.title}</span>
          </div>
          <div class="custom-pin-circle">
            ${style.icon}
          </div>
          <div class="custom-pin-tip"></div>
        `;

        pinContainer.onclick = () => {
          map.setLevel(3, { animate: true });
          map.panTo(coords);
          setSelectedEvent(event);
        };

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: coords,
          content: pinContainer,
          yAnchor: 1,
        });

        customOverlay.setMap(map);
        overlaysRef.current.push(customOverlay);
      });

      // 성공한 좌표들로만 동선 연결선(Polyline) 그리기
      if (linePath.length > 1) {
        const polyline = new window.kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 4,
          strokeColor: "#3B82F6",
          strokeOpacity: 0.7,
          strokeStyle: "dashed",
        });
        polyline.setMap(map);
        polylinesRef.current.push(polyline);
      }

      // 지도 시야 범위 자동 맞춤
      if (linePath.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        linePath.forEach((coords) => bounds.extend(coords));
        map.setBounds(bounds);
      }
    });
  }, [filteredEvents, searchLocation]);

  // 전체 보기 버튼 클릭 이벤트
  const handleResetBounds = () => {
    setSelectedDate("ALL");
    setSelectedRegion("ALL");
    setSelectedEvent(null);
  };

  const initMap = useCallback(() => {
    if (!window.kakao || !window.kakao.maps || !mapContainerRef.current) return;

    window.kakao.maps.load(() => {
      if (!mapContainerRef.current) return;

      if (!kakaoMapRef.current) {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };
        kakaoMapRef.current = new window.kakao.maps.Map(
          mapContainerRef.current,
          options,
        );
      }

      updateMarkers();
    });
  }, [updateMarkers]);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    }
  }, [initMap]);

  // 필터가 변경될 때 마커 재생성
  useEffect(() => {
    if (kakaoMapRef.current && window.kakao?.maps) {
      updateMarkers();
    }
  }, [updateMarkers]);

  // 창 크기 변경 및 오른쪽 패널 열림/닫힘 시 타일 재계산
  useEffect(() => {
    if (kakaoMapRef.current) {
      setTimeout(() => {
        kakaoMapRef.current.relayout();
      }, 100);
    }
  }, [selectedEvent]);

  useEffect(() => {
    const handleResize = () => {
      if (kakaoMapRef.current) {
        kakaoMapRef.current.relayout();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedCategoryStyle = selectedEvent
    ? getCategoryStyle(selectedEvent.category)
    : null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={initMap}
      />

      <div className={styles.mapWrapper}>
        <div className={styles.mapHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.headerIcon}>🗺️</span>
            <h3 className={styles.headerTitle}>여행 일정 경로</h3>
          </div>

          <div className={styles.headerControls}>
            <button className={styles.resetBtn} onClick={handleResetBounds}>
              🔍 전체 보기
            </button>

            <div className={styles.legend}>
              <span className={styles.food}>● 맛집</span>
              <span className={styles.spot}>● 관광지</span>
              <span className={styles.hotel}>● 숙소</span>
            </div>
          </div>
        </div>

        <div className={styles.filterContainer}>
          {/* 날짜 필터 Group */}
          {dateList.length > 0 && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>📅 일차:</span>
              <button
                className={`${styles.chip} ${
                  selectedDate === "ALL" ? styles.active : ""
                }`}
                onClick={() => setSelectedDate("ALL")}
              >
                전체
              </button>
              {dateList.map((d) => (
                <button
                  key={d.raw}
                  className={`${styles.chip} ${
                    selectedDate === d.raw ? styles.active : ""
                  }`}
                  onClick={() => setSelectedDate(d.raw)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {/* 지역 필터 Group */}
          {regionList.length > 0 && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>📍 지역:</span>
              <button
                className={`${styles.chip} ${
                  selectedRegion === "ALL" ? styles.active : ""
                }`}
                onClick={() => setSelectedRegion("ALL")}
              >
                전체
              </button>
              {regionList.map((r) => (
                <button
                  key={r}
                  className={`${styles.chip} ${
                    selectedRegion === r ? styles.active : ""
                  }`}
                  onClick={() => setSelectedRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 검색 실패로 경로에서 제외된 장소 알림 바 */}
        {failedEvents.length > 0 && (
          <div className={styles.failedNotice}>
            <span>⚠️</span>
            <span>
              위치를 찾을 수 없어 지도 경로에서 제외됨:{" "}
              <strong>{failedEvents.map((e) => e.title).join(", ")}</strong>
            </span>
          </div>
        )}

        {/* 지도 및 정보 패널 영역 */}
        <div className={styles.mapContentWrapper}>
          <div ref={mapContainerRef} className={styles.mapViewport}></div>

          {/* 우측 상세정보 패널 */}
          <div className={styles.infoPanel}>
            {selectedEvent ? (
              <>
                <div>
                  <div className={styles.panelHeader}>
                    <span
                      className={styles.categoryBadge}
                      style={{ backgroundColor: selectedCategoryStyle?.bg }}
                    >
                      {selectedCategoryStyle?.icon}{" "}
                      {selectedCategoryStyle?.label}
                    </span>
                    <button
                      className={styles.closeBtn}
                      onClick={() => setSelectedEvent(null)}
                    >
                      ✕
                    </button>
                  </div>

                  {selectedEvent.img && (
                    <img
                      src={selectedEvent.img}
                      alt={selectedEvent.title}
                      className={styles.placeImg}
                    />
                  )}

                  <h4 className={styles.placeTitle}>{selectedEvent.title}</h4>

                  <div className={styles.placeDetails}>
                    {selectedEvent.address && (
                      <div className={styles.detailRow}>
                        <span>📍</span>
                        <span>{selectedEvent.address}</span>
                      </div>
                    )}
                    {selectedEvent.start && (
                      <div className={styles.detailRow}>
                        <span>⏰</span>
                        <span>
                          {formatTimeRange(
                            selectedEvent.start,
                            selectedEvent.end,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.icon}>👆</span>
                <p>
                  지도 위의 핑을 클릭하면
                  <br />
                  상세 정보가 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
