import style from '../../../styles/main/mainpage.module.scss';

export default function myPage() {
  return (
    <>
      {/* 상단 메뉴 */}
      <div className={style.top}>
        {/* 이미지 */}
        <div>
          <img className={style.main_img} />
        </div>

        <div>
          <div>
            <p>린님</p>
            <br />
            <p>오늘은 어떤 여행을</p>
            <br />
            <p>떠나볼까요?</p>
          </div>
          {/* 그룹 소식 */}
          <div>
            <div>
              <p>나의 그룹 소식</p>
              <p>아직 새로운 그룹 소식이 없어요</p>
            </div>
            <div>
              <img />
            </div>
          </div>
        </div>
      </div>

      {/* 중단 메뉴 */}
      <div>
        <div>
          <div>
            <p>오늘 메이트들의</p>
            <br />
            <p>핫플은?</p>
          </div>
          <div>
            <p>메이트들이 리뷰한 핫플레이스!</p>
            <br />
            <p>지금 만나볼까요?</p>
          </div>
          <div>
            <p>보러가기</p>
          </div>
        </div>
        <div></div>
      </div>

      {/* 하단 메뉴 */}
      <div>
        <div></div>
        <div>
          <div>
            <p>투리브 요모조모</p>
            <br />
            <p>투리브의 여행 요모조모 추천 일지</p>
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}
