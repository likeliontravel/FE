import Link from "next/link";
import style from "../../../styles/component/header.module.scss";

export default function Header() {
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
              <div className={style.userImage}></div>
              {/* 이름 */}
              <Link href="/mypage">
                <p>린님</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
