"use client";

import { useRef, useState } from "react";
import style from "../../../styles/group/groupPage.module.scss";
import useBetweenScroll from "../../../util/useBetweenScroll";
import { useRouter } from "next/navigation";
import GroupCreateModal from "./GroupCreateModal";

const ifGroup = ({ groups }: { groups: any[] }) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useBetweenScroll(scrollContainerRef);

  const handleGroupClick = (id: number) => {
    router.push(`/group/${id}`);
  };

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
              onClick={() => handleGroupClick(group.id)}
            >
              <div className={style.group_content_title}>
                <p>{group.groupName}</p>
              </div>
              <div className={style.group_content_people}>
                <div className={style.group_img}></div>
                <p>8명</p>
              </div>
              <div className={style.shapes_img}></div>
            </div>
          ))}
          {/* 그룹 추가하기 */}
          <div className={style.group_plus}>
            <div></div>
            <p>그룹 추가하기</p>
          </div>
        </div>
      </div>
      {/* 일정 */}
      <div className={style.schedule_div}>
        <div className={style.comming_div}>
          <div className={style.commig_div_p_div}>
            <div className={style.commig_div_p_div_flex_div}>
              <div className={style.commig_div_p_div_flex_div_title}>
                <p>{groups[0].groupName}</p>
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
            onClick={() => handleGroupClick(groups[0].id)}
          >
            <p>보러가기 {">"}</p>
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
      {isModalOpen && <GroupCreateModal onClose={closeModal} />}
    </>
  );
};

export default ifGroup;
