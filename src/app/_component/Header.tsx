"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import style from "../../../styles/component/header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { logoutUser } from "../../../util/login/authSlice";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth || {});

  const handleLogout = async () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      try {
        await dispatch(logoutUser()).unwrap();
        alert("로그아웃 되었습니다.");
        router.push("/login");
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

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
            <a onClick={() => handleProtectedClick("/schedule")}>
              <p>여행 일정 짜기</p>
            </a>
            <a onClick={() => handleProtectedClick("/group")}>
              <p>나의 그룹</p>
            </a>
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
                style={{
                  backgroundImage: `url(${"/imgs/default-profile.png"})`,
                }}
              ></div>
              
              {user ? (
                <div className={style.loggedInUser}>
                  <Link href="/mypage">
                    <p>{user.name}님</p>
                  </Link>
                  <p className={style.logoutButton} onClick={handleLogout}>
                    로그아웃
                  </p>
                </div>
              ) : (
                <Link href="/login">
                  <p>로그인</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}