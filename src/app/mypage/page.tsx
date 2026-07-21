"use client";

import { useEffect } from "react";
import Link from "next/link";
import style from "../../../styles/mypage/mypage.module.scss";
import MiniCalendar from "../../../util/schedule/scheduleCalendar/MiniCalendar";
import UseReactSelect from "../../../util/select/UseReactSelect";
import KakaoMap from "../../../util/KakaoMap";
import ScheduleCheck from "../../../util/schedule/ScheduleCheck";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchMyPageInfo } from "../../../util/mypage/mypageSlice";
import {
  fetchScheduleDetails,
  fetchScheduleList,
  setSelectedCalendarSchedule,
} from "../../../util/schedule/scheduleSlice";
import { fetchGroupDetail } from "../../../util/group/groupSlice";

export default function MyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.mypage);

  const { scheduleList, selectedCalendarSchedule } = useSelector(
    (state: RootState) => state.schedule,
  );

  useEffect(() => {
    dispatch(fetchMyPageInfo());
    dispatch(fetchScheduleList());
  }, [dispatch]);

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

        <ScheduleCheck groupName={selectedCalendarSchedule.value} />
      </div>

      <KakaoMap />
    </div>
  );
}
