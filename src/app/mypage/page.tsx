"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import style from "../../../styles/mypage/mypage.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import MiniCalendar from "../../../util/schedule/scheduleCalendar/MiniCalendar";
import UseReactSelect from "../../../util/select/UseReactSelect";
import KakaoMap from "../../../util/KakaoMap";
import ScheduleCheck from "../../../util/schedule/ScheduleCheck";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchMyPageInfo } from "../../../util/mypage/mypageSlice";

export default function myPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { userInfo } = useSelector((state: RootState) => state.mypage);

  useEffect(() => {
    dispatch(fetchMyPageInfo());
  }, [dispatch]);

  return (
    <div className={style.mypage_div}>
      {/* 상단 메뉴 */}
      <div className={style.mypage_top_div}>
        {/* 회원, 미니 캘린더 */}
        <div className={style.left_div}>
          {/* 회원 */}
          <div className={style.userbox}>
            {/* 프로필 사진 */}
            <div>
              <img
                className={style.profile}
                style={{
                  backgroundImage: `url(${userInfo?.profileImageUrl || "/imgs/default-profile.png"})`,
                }}
              />
            </div>
            {/* 이름 */}
            <div className={style.user}>
              <p className={style.name}>{userInfo?.name}</p>
              <p className={style.email}>{userInfo?.email}</p>
              <p className={style.account}>연동 소셜 계정</p>
            </div>
            {/* 회원 정보 수정 및 소셜 계정 */}
            <div className={style.oauthbox}>
              <Link href="/mypage/modify">
                <button>회원 정보 수정</button>
              </Link>
              <div className={style.oauth}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          {/* 캘린더 */}
          <div className={style.calendar_div}>
            <UseReactSelect type="calendar" />
            <MiniCalendar />
          </div>
        </div>

        {/* 여행 계획 */}
        <ScheduleCheck />
      </div>

      {/* 카카오맵 */}
      <KakaoMap />
    </div>
  );
}
