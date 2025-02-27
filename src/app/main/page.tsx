'use client';

import { useRef } from 'react';
import style from '../../../styles/main/mainpage.module.scss';
import useBetweenScroll from '../../../util/useBetweenScroll';

export default function mainPage() {
  const topScrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomScrollContainerRef = useRef<HTMLDivElement>(null);

  useBetweenScroll(topScrollContainerRef);
  useBetweenScroll(bottomScrollContainerRef);

  return (
    <div className={style.body}>
      {/* 상단 메뉴 */}
      <div className={style.top}>
        {/* 이미지 */}
        <div>
          <div className={style.main_img}></div>
        </div>

        <div className={style.top_main}>
          <div className={style.main_title}>
            <p>린님</p>
            <p>오늘은 어떤 여행을</p>
            <p>떠나볼까요?</p>
          </div>
          {/* 그룹 소식 */}
          <div>
            <div className={style.group_news}>
              <p className={style.my_group_news}>나의 그룹 소식</p>
              <p className={style.no_group_news}>
                아직 새로운 그룹 소식이 없어요
              </p>
            </div>
            <div>
              <div className={style.none_img}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 중단 메뉴 */}
      <div className={style.middle}>
        <div className={style.middle_text}>
          <div className={style.middle_title_text}>
            <p>오늘 메이트들의</p>
            <p>핫플은?</p>
          </div>
          <div className={style.middle_title_content_text}>
            <p>메이트들이 리뷰한 핫플레이스!</p>
            <p>지금 만나볼까요?</p>
          </div>
          <div className={style.middle_show}>
            <p>보러가기 {'>'}</p>
          </div>
        </div>
        {/* 핫플 리스트 */}
        <div className={style.mate_hotplace} ref={topScrollContainerRef}>
          <div className={style.middle_content}>
            <div className={style.middle_content_img}></div>
            <div className={style.middle_content_details}>
              <div className={style.middle_content_category}></div>
              <div className={style.middle_content_title}></div>
              <div className={style.middle_content_user}>
                <div className={style.middle_content_profile}></div>
                <div className={style.middle_content_text}></div>
              </div>
            </div>
          </div>
          <div className={style.middle_content}>
            <div className={style.middle_content_img}></div>
            <div className={style.middle_content_details}>
              <div className={style.middle_content_category}>Hot 게시물</div>
              <div className={style.middle_content_title}>
                고즈넉한 국내 여행지 소개해요
              </div>
              <div className={style.middle_content_user}>
                <div className={style.middle_content_profile}>
                  <div className={style.middle_content_profile_img}></div>
                  <div className={style.middle_content_profile_name}>
                    여정이에요오오오오
                  </div>
                </div>
                <div className={style.middle_content_text}>
                  제가 가본 국내 고즈넉한 여행지 추천해요! 안녕하세요 저번주
                  경주 여행 다녀온 여정입니다 이번 여행은 정말 재밌었고 다음에
                  또 가고 싶네요!
                </div>
              </div>
            </div>
          </div>
          <div className={style.middle_content}>
            <div className={style.middle_content_img}></div>
            <div className={style.middle_content_details}>
              <div className={style.middle_content_category}></div>
              <div className={style.middle_content_title}></div>
              <div className={style.middle_content_user}>
                <div className={style.middle_content_profile}></div>
                <div className={style.middle_content_text}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 메뉴 */}
      <div className={style.bottom}>
        <div className={style.bottom_text}>
          <p className={style.bottom_text_title}>투리브 요모조모</p>
          <p className={style.bottom_text_content}>
            투리브의 여행 요모조모 추천 일지
          </p>
        </div>
        {/* 여행 추천 리스트 */}
        <div className={style.bottom_place} ref={bottomScrollContainerRef}>
          <div className={style.bottom_content}>
            <div className={style.bottom_content_title}>
              올 겨울 크리스마스는 이.거.다
            </div>
            <div className={style.bottom_content_text}>
              올 겨울 따뜻한 크리스마스를 위해 무제가 엄선해온 여행지 TOP 3!
            </div>
          </div>
          <div className={style.bottom_content}></div>
          <div className={style.bottom_content}></div>
        </div>
      </div>
    </div>
  );
}
