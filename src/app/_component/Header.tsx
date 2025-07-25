"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import style from "../../../styles/component/header.module.scss";

export default function Header() {
  const token = localStorage.getItem("accessToken");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://localhost:8080/user/getProfile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setUser(json.data[0]);
        } else {
        }
      } catch (error) {
        console.error("회원 정보 불러오기 실패:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div className={style.header}>
        {/* 로고 */}
        <Link href="/main" className={style.logo}></Link>

        {/* 네비게이션 바 */}
        <div className={style.navBar}>
          {/* 네비게이션 그룹 */}
          <div className={style.navGroup}>
            <Link href="/schedule">
              <p>여행 일정 짜기</p>
            </Link>
            <Link href="/group">
              <p>나의 그룹</p>
            </Link>
            <p>여행지 추천</p>
            <p>지역별 여행 게시판</p>
          </div>
          {/* 회원 그룹 */}
          <div className={style.userGroup}>
            {/* 알람 */}
            <div className={style.alram}></div>
            {/* 회원 정보 */}
            <div className={style.user}>
              {/* 사진 */}
              <div
                className={style.userImage}
                style={{ backgroundImage: `url(${user?.profileImageUrl})` }}
              ></div>
              {/* 이름 */}
              <Link href="/mypage">
                <p>{user?.name}</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
