import style from '../../../styles/mypage/mypage.module.scss';

export default function Modify() {
  return (
    <div>
      <h2>마이페이지</h2>
      <div>
        <div>
          <div>
            <img src="" alt="프로필" />
            <p>린님</p>
            <p>@rin1234</p>
          </div>
          <div>
            <div>
              <div></div>
              <p>내 정보 관리</p>
            </div>
            <div>
              <div></div>
              <p>구독 결제 내역</p>
            </div>
            <div>
              <div></div>
              <p>그룹 및 일정</p>
            </div>
          </div>
        </div>
        <div>
          <h3>내 정보 관리</h3>
          <div>
            <div>
              <div>
                <p>기본 회원 정보</p>
                <p>회원 정보 수정</p>
              </div>
              <div>
                <div>
                  <p>닉네임</p>
                  <p>린</p>
                </div>
                <div>
                  <p>나이</p>
                  <p>만21세</p>
                </div>
              </div>
              <div>
                <div>
                  <p>이메일</p>
                  <p>rin1234@naver.com</p>
                </div>
                <div>
                  <p>성별</p>
                  <p>여</p>
                </div>
              </div>
            </div>
            <div>
              <p>연동 계정 관리</p>
              <p>
                현재 <i>1개</i>의 연동계정 보유
              </p>
              <img src="" alt="social" />
              <img src="" alt="social" />
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
  );
}
