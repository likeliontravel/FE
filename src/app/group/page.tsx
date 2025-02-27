'use client';

import { useRef } from 'react';
import style from '../../../styles/group/groupPage.module.scss';
import useBetweenScroll from '../../../util/useBetweenScroll';

export default function groupPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useBetweenScroll(scrollContainerRef);

  return (
    <div className={style.body}>
      {/* 그룹 */}
      <div className={style.top_div}>
        <div className={style.group_div}>
          <p>나의 그룹</p>
          <div className={style.group_craete_div}>
            <p>그룹 생성</p>
            <div className={style.group_img}></div>
          </div>
        </div>
        {/* 그룹 리스트 */}
        <div className={style.group_list} ref={scrollContainerRef}>
          <div className={style.group_content}>
            <div className={style.group_content_title}>
              <p>멋사</p>
            </div>
            <div className={style.group_content_people}>
              <div className={style.group_img}></div>
              <p>8명</p>
            </div>
            <div className={style.shapes_img}></div>
          </div>
          <div className={style.group_content}>
            <div className={style.group_content_title}>
              <p>멋사</p>
            </div>
            <div className={style.group_content_people}>
              <div className={style.group_img}></div>
              <p>8명</p>
            </div>
            <div className={style.shapes_img}></div>
          </div>
          <div className={style.group_content}>
            <div className={style.group_content_title}>
              <p>멋사</p>
            </div>
            <div className={style.group_content_people}>
              <div className={style.group_img}></div>
              <p>8명</p>
            </div>
            <div className={style.shapes_img}></div>
          </div>
          <div className={style.group_content}>
            <div className={style.group_content_title}>
              <p>멋사</p>
            </div>
            <div className={style.group_content_people}>
              <div className={style.group_img}></div>
              <p>8명</p>
            </div>
            <div className={style.shapes_img}></div>
          </div>
          <div className={style.group_content}>
            <div className={style.group_content_title}>
              <p>멋사</p>
            </div>
            <div className={style.group_content_people}>
              <div className={style.group_img}></div>
              <p>8명</p>
            </div>
            <div className={style.shapes_img}></div>
          </div>
        </div>
      </div>
      {/* 일정 */}
      <div className={style.schedule_div}>
        <div className={style.comming_div}>
          <div className={style.commig_div_p_div}>
            <div className={style.commig_div_p_div_flex_div}>
              <div className={style.commig_div_p_div_flex_div_title}>
                <p>멋사</p>
              </div>
              <p>의</p>
            </div>
            <div className={style.commig_div_p_div_flex_div_p}>
              <p>
                일정이 <br /> 다가오고있어요
              </p>
              <div className={style.ellipse}></div>
            </div>
          </div>
          <div className={style.commig_div_show}>
            <p>보러가기 {'>'}</p>
          </div>
        </div>
        {/* 그룹 메인 이미지 */}
        <div>
          <div className={style.schedule_div_group_img}></div>
          <div className={style.schedule_div_deadline}>
            <p>D-12</p>
          </div>
        </div>
      </div>
    </div>
  );
}
