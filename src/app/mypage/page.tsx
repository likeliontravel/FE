"use client";

import { useEffect } from "react";
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

export default function MyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, loading } = useSelector((state: RootState) => state.mypage);

  useEffect(() => {
    dispatch(fetchMyPageInfo());
  }, [dispatch]);

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
              <p className={style.name}>{userInfo?.name || "여행자님"}</p>
              <p className={style.email}>{userInfo?.email || ""}</p>
              <p className={style.account}>연동 소셜 계정</p>
            </div>
            <div className={style.oauthbox}>
              <Link href="/mypage/modify">
                <button>회원 정보 수정</button>
              </Link>
              <div className={style.oauth}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <div className={style.calendar_div}>
            <UseReactSelect type="calendar" />
            <MiniCalendar />
          </div>
        </div>

        <ScheduleCheck />
      </div>

      <KakaoMap />
    </div>
  );
}
