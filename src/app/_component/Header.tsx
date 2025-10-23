"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import style from "../../../styles/component/header.module.scss";

interface UserProfile {
  name: string;
  profileImageUrl?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://172.31.45.175:8080/user/getProfile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
            console.error("Failed to fetch user profile, status:", res.status);
            return;
        }

        const json = await res.json();

        if (json.success && json.data) {
          setUser(Array.isArray(json.data) ? json.data[0] : json.data);
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
        <Link href="/main" className={style.logo}></Link>
        <div className={style.navBar}>
          <div className={style.navGroup}>
            <Link href="/schedule">
              <p>여행 일정 짜기</p>
            </Link>
            <Link href="/group">
              <p>나의 그룹</p>
            </Link>
            <Link href="/RandomHome">
              <p>여행지 추천</p>
            </Link>
            <Link href="/post">
              <p>지역별 여행 게시판</p>
            </Link>
          </div>
          <div className={style.userGroup}>
            <div className={style.alram}></div>
          <div className={style.user}>
            <div
              className={style.userImage}
              style={{ backgroundImage: `url(${user?.profileImageUrl || '/imgs/default-profile.png'})` }}
            ></div>
            <Link href={user ? "/mypage" : "/login"}>
              {user ? <p>{user.name}님</p> : <p>로그인</p>}
            </Link>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}