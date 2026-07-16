"use client";

import { useEffect, useRef, useState } from "react";
import style from "../../../styles/group/groupPage.module.scss";
import useBetweenScroll from "../../../util/useBetweenScroll";
import { useRouter } from "next/navigation";
import GroupCreateModal from "./GroupCreateModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchNearestSchedule } from "../../../util/group/groupSlice";

const ifGroup = ({ groups }: { groups: any[] }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { nearestSchedule } = useSelector((state: RootState) => state.group);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useBetweenScroll(scrollContainerRef);

  const handleGroupClick = (groupName: string) => {
    router.push(`/group/${groupName}`);
  };

  useEffect(() => {
    dispatch(fetchNearestSchedule());
  }, [dispatch]);

  const hasSchedule = !!nearestSchedule;

  return (
    <>
      {/* 그룹 */}
      <div className={style.top_div}>
        <div className={style.group_div}>
          <p>나의 그룹</p>
          <div className={style.group_create_div} onClick={openModal}>
            <p>그룹 생성</p>
            <div className={style.group_img}></div>
          </div>
        </div>
        {/* 그룹 리스트 */}
        <div className={style.group_list} ref={scrollContainerRef}>
          {groups.map((group) => (
            <div
              key={group.id}
              className={style.group_content}
              onClick={() => handleGroupClick(group.groupName)}
            >
              <div className={style.group_content_title}>
                <p>{group.groupName}</p>
              </div>
              <div className={style.shapes_img}></div>
            </div>
          ))}
          {/* 그룹 추가하기 */}
          <div className={style.group_plus} onClick={openModal}>
            <div></div>
            <p>그룹 추가하기</p>
          </div>
        </div>
      </div>
      {/* 일정 */}
      <div className={style.schedule_div}>
        <div className={style.comming_div}>
          {hasSchedule ? (
            /* 1. 일정이 정상적으로 존재할 때 */
            <>
              <div className={style.commig_div_p_div}>
                <div className={style.commig_div_p_div_flex_div}>
                  <div className={style.commig_div_p_div_flex_div_title}>
                    <p>{nearestSchedule.groupName}</p>
                  </div>
                  <p>의</p>
                </div>
                <div className={style.commig_div_p_div_flex_div_p}>
                  <p>
                    일정이 <br /> 다가오고 있어요
                  </p>
                  <div className={style.ellipse}></div>
                </div>
              </div>
              <div
                className={style.commig_div_show}
                onClick={() => handleGroupClick(nearestSchedule.groupName)}
              >
                <p>보러가기 {">"}</p>
              </div>
            </>
          ) : (
            /* 2. 일정이 없거나 지났을 때 (새로운 일정을 만들어보아요) */
            <>
              <div className={style.non_schedule_div}>
                <div className={style.non_comming_div}>
                  <p>새로운 여정을</p>
                  <p>투리브에서</p>
                  <p>시작해볼까요?</p>
                </div>
                {/* 그룹 메인 이미지 */}
                <div className={style.schedule_div_group_img}></div>
              </div>
            </>
          )}
        </div>

        {/* 디데이 배너 영역 */}
        <div>
          <div className={style.schedule_div_group_img}>
            {hasSchedule && (
              <p>
                {nearestSchedule.dDay === 0
                  ? "D-Day"
                  : `D-${nearestSchedule.dDay}`}
              </p>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && <GroupCreateModal onClose={closeModal} />}
    </>
  );
};

export default ifGroup;
