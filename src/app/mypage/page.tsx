"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import Link from "next/link";
import style from "../../../styles/mypage/mypage.module.scss";
import MiniCalendar from "../../../util/schedule/scheduleCalendar/MiniCalendar";
import UseReactSelect from "../../../util/select/UseReactSelect";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchMyPageInfo } from "../../../util/mypage/mypageSlice";
import {
  fetchScheduleDetails,
  fetchScheduleList,
  setSelectedCalendarSchedule,
} from "../../../util/schedule/scheduleSlice";
import { fetchGroupDetail } from "../../../util/group/groupSlice";

const KakaoMap = dynamic(() => import("../../../util/mypage/KakaoMap"), {
  ssr: false,
  loading: () => <div>지도를 불러오는 중입니다...</div>,
});

const ScheduleCheck = dynamic(
  () => import("../../../util/schedule/ScheduleCheck"),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: "500px", padding: "20px" }}>
        일정을 불러오는 중입니다...
      </div>
    ),
  },
);

export default function MyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.mypage);

  const { scheduleList, selectedCalendarSchedule } = useSelector(
    (state: RootState) => state.schedule,
  );

  const isInitialMount = useRef(true);

  useEffect(() => {
    dispatch(fetchMyPageInfo());

    dispatch(fetchScheduleList())
      .unwrap()
      .then((fetchedList) => {
        if (
          fetchedList.length > 0 &&
          selectedCalendarSchedule.value === "default"
        ) {
          const sortedSchedules = [...fetchedList].sort((a, b) => {
            return (
              new Date(a.startSchedule).getTime() -
              new Date(b.startSchedule).getTime()
            );
          });

          const targetGroup = sortedSchedules[0];

          dispatch(setSelectedCalendarSchedule(targetGroup));
          dispatch(fetchGroupDetail(targetGroup.value));
          dispatch(fetchScheduleDetails(targetGroup.value));
        }
      })
      .catch((error) => console.error("일정 리스트 로딩 실패:", error));
  }, [dispatch]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentGroupName = selectedCalendarSchedule.value;
    if (currentGroupName && currentGroupName !== "default") {
      dispatch(fetchGroupDetail(currentGroupName));
      dispatch(fetchScheduleDetails(currentGroupName));
    }
  }, [selectedCalendarSchedule.value, dispatch]);

  useEffect(() => {
    if (
      scheduleList.length > 0 &&
      selectedCalendarSchedule.value === "그룹명"
    ) {
      const sortedSchedules = [...scheduleList].sort((a, b) => {
        const dateA = new Date(a.startSchedule).getTime();
        const dateB = new Date(b.startSchedule).getTime();
        return dateA - dateB;
      });

      const targetGroup = sortedSchedules[0];

      dispatch(setSelectedCalendarSchedule(targetGroup));
    }
  }, [scheduleList, selectedCalendarSchedule.value, dispatch]);

  useEffect(() => {
    const currentGroupName = selectedCalendarSchedule.value;

    if (currentGroupName) {
      dispatch(fetchGroupDetail(currentGroupName));
      dispatch(fetchScheduleDetails(currentGroupName));
    }
  }, [selectedCalendarSchedule.value, dispatch]);

  return (
    <div className={style.mypage_div}>
      <div className={style.mypage_top_div}>
        <div className={style.left_div}>
          <div className={style.userbox}>
            <div>
              <img
                src={userInfo?.profileImageUrl || "/imgs/default-profile.png"}
                alt="프로필 사진"
                className={style.profile}
              />
            </div>
            <div className={style.user}>
              <p className={style.name}>{userInfo?.name}</p>
              <p className={style.email}>{userInfo?.email || ""}</p>
              {/* <p className={style.account}>연동 소셜 계정</p> */}
            </div>
            <div className={style.oauthbox}>
              <Link href="/mypage/modify">
                <button>회원 정보 수정</button>
              </Link>
              {/* <div className={style.oauth}>
                <FontAwesomeIcon icon={faPlus} />
              </div> */}
            </div>
          </div>
          <div className={style.calendar_div}>
            <UseReactSelect type="calendar" calendarOptions={scheduleList} />
            <MiniCalendar />
          </div>
        </div>

        <ScheduleCheck
          groupName={selectedCalendarSchedule.value}
          isReadOnly={true}
        />
      </div>

      <KakaoMap />
    </div>
  );
}
