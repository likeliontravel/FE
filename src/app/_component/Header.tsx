import style from '../../../styles/component/header.module.scss';

export default function Header() {
  return (
    <>
      <div className={style.header}>
        {/* 로고 */}
        <div className={style.logo}></div>

        {/* 네비게이션 바 */}
        <div className={style.navBar}>
          {/* 네비게이션 그룹 */}
          <div className={style.navGroup}>
            <p>여행 일정 짜기</p>
            <p>나의 그룹</p>
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
              <p>린님</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
