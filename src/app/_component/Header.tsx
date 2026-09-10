"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import style from "../../../styles/component/header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { logoutUser } from "../../../util/login/authSlice";
import { fetchUnreadCount } from "../../../util/notification/notificationSlice";
import { useNotificationSSE } from "../../../util/notification/useNotificationSSE";
import NotificationModal from "./NotificationModal";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth || {});
  const { unreadCount } = useSelector((state: RootState) => state.notification || { unreadCount: 0 });

  const [isNotiOpen, setIsNotiOpen] = useState(false);

  useNotificationSSE();

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [user, dispatch]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoForward = () => {
    router.forward();
  };

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

  const handleProtectedLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!user) {
      e.preventDefault(); 
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
    }
  };

  const handleAlarmClick = () => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
      return;
    }
    setIsNotiOpen((prev) => !prev);
  };

  return (
    <>
      <div className={style.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/main" className={style.logo}></Link>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={handleGoBack}
              title="뒤로 가기"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                transition: "all 0.15s ease",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.color = "#1e293b";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleGoForward}
              title="앞으로 가기"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                transition: "all 0.15s ease",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.color = "#1e293b";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className={style.navBar}>
          <div className={style.navGroup}>
            <Link 
              href="/schedule" 
              onClick={(e) => handleProtectedLinkClick(e, "/schedule")}
            >
              <p>여행 일정 짜기</p>
            </Link>

            <Link 
              href="/group"
              onClick={(e) => handleProtectedLinkClick(e, "/group")}
            >
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
            <div style={{ position: "relative" }}>
              <div 
                className={style.alram} 
                onClick={handleAlarmClick}
                style={{ cursor: "pointer", position: "relative" }}
              >
                {user && unreadCount > 0 && (
                  <span 
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      backgroundColor: "#27ABF1",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "800",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ffffff",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                      lineHeight: "1",
                      pointerEvents: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              <NotificationModal 
                isOpen={isNotiOpen} 
                onClose={() => setIsNotiOpen(false)} 
              />
            </div>

            <div className={style.user}>
              {user && (
                <div
                  className={style.userImage}
                  style={{
                    backgroundImage: `url(${user.profileImageUrl || "/imgs/default-profile.png"})`,
                  }}
                ></div>
              )}
              
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