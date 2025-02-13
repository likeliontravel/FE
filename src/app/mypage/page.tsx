import style from '../../../styles/mypage/mypage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CustomCalendar from '../../../util/calendar/CustomCalendar';

export default function myPage() {
  return (
    <>
      {/* 상단 메뉴 */}
      <div>
        {/* 회원, 미니 캘린더 */}
        <div>
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
              <button>회원 정보 수정</button>
              <div className={style.oauth}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          {/* 캘린더 */}
          <div>
            <CustomCalendar />
          </div>
        </div>

        {/* 여행 계획 */}
        <div></div>
      </div>

      {/* 프로모션 배너 */}
      <div></div>
    </>
  );
}
