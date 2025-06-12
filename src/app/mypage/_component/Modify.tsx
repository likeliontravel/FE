import style from '../../../styles/mypage/modify.module.scss';

export default function Modify() {
  return (
    <div className={style.container}>
      <div className={style.big_div}>
        <h2>마이페이지</h2>
        <div className={style.mypage_div}>
          <div className={style.left_modify}>
            <div className={style.img}>
              <img src="/imgs/Ellipse5.png" alt="프로필" />
              <img
                className={style.modify}
                src="/imgs/프로필 수정.png"
                alt="프로필 수정"
              />
              <p className={style.name}>린님</p>
              <p className={style.mail}>@rin1234</p>
            </div>
            <div className={style.left_modify_nav}>
              <div className={style.select_nav}>
                <img src="/imgs/bar_icon.png" alt="icon" />
                <p>내 정보 관리</p>
              </div>
              <div>
                <img src="/imgs/bar_icon_2.png" alt="icon" />
                <p>구독 결제 내역</p>
              </div>
              <div>
                <img src="/imgs/bar_icon_3.png" alt="icon" />
                <p>그룹 및 일정</p>
              </div>
            </div>
          </div>
          <div className={style.mypage_content}>
            <h3>내 정보 관리</h3>
            <div className={style.mypage_content_div}>
              <div className={style.user}>
                <div className={style.user_modify}>
                  <p>기본 회원 정보</p>
                  <button>회원 정보 수정</button>
                </div>
                <div className={style.user_box}>
                  <div className={style.user_box_left}>
                    <div className={style.user_box_left_top}>
                      <p className={style.name}>닉네임</p>
                      <p className={style.p}>린</p>
                    </div>
                    <div className={style.user_box_left_bottom}>
                      <p className={style.email}>이메일</p>
                      <p className={style.p}>rin1234@naver.com</p>
                    </div>
                  </div>
                  <div className={style.user_box_right}>
                    <div className={style.user_box_right_top}>
                      <p className={style.age}>나이</p>
                      <p className={style.p}>만21세</p>
                    </div>
                    <div className={style.user_box_right_bottom}>
                      <p className={style.sex}>성별</p>
                      <p className={style.p}>여</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={style.social}>
                <div className={style.social_div}>
                  <div className={style.social_div_left}>
                    <p className={style.social_account}>연동 계정 관리</p>
                    <p className={style.social_get}>
                      현재 <i>1개</i>의 연동계정 보유
                    </p>
                  </div>
                  <div className={style.social_img}>
                    <img src="" alt="social" />
                    <img src="/imgs/plus_btn.png" alt="social" />
                  </div>
                </div>
              </div>
              <div>
                <p>이용 약관 동의 여부</p>
                <div>약관보기 &gt;</div>
              </div>
              <div>
                <p>구독 플랜 여부</p>
                <p>현재 구독플랜을 이용중이에요</p>
                <p>다음 결제일 : 2025/3/2</p>
                <div>구독하기 &gt;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
