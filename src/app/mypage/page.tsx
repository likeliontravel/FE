import Link from "next/link";
import style from "../../../styles/mypage/mypage.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import MiniCalendar from "../../../util/scheduleCalendar/MiniCalendar";
import UseReactSelect from "../../../util/select/UseReactSelect";
import KakaoMap from "../../../util/KakaoMap";
import ScheduleCheck from "../../../util/ScheduleCheck";

export default function myPage() {
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
              <img className={style.profile} />
            </div>
            {/* 이름 */}
            <div className={style.user}>
              <p className={style.name}>린님</p>
              <p className={style.email}>@rin1234</p>
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
