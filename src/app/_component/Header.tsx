"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import style from "../../../styles/component/header.module.scss";

interface UserProfile {
  name: string;
  profileImageUrl?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("https://api.toleave.shop/user/getProfile/", {
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

  const handleProtectedClick = (path: string) => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
      return;
    }
    router.push(path);
  };

  return (
    <>
      <div className={style.header}>
        <Link href="/main" className={style.logo}></Link>
        <div className={style.navBar}>
          <div className={style.navGroup}>
            <p onClick={() => handleProtectedClick("/schedule")}>여행 일정 짜기</p>
            <p onClick={() => handleProtectedClick("/group")}>나의 그룹</p>
            <Link href="/RandomHome">
              <p>여행지 추천</p>
            </Link>

            <p onClick={() => handleProtectedClick("/post")}>지역별 여행 게시판</p>
          </div>

          <div className={style.userGroup}>
            <div className={style.alram}></div>
            <div className={style.user}>
              <div
                className={style.userImage}
                style={{
                  backgroundImage: `url(${user?.profileImageUrl || "/imgs/default-profile.png"})`,
                }}
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
