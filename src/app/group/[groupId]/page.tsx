"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import style from "../../../../styles/group/groupDetail.module.scss";
import MiniCalendar from "../../../../util/scheduleCalendar/MiniCalendar";
import ScheduleCheck from "../../../../util/ScheduleCheck";
import Footer from "@/app/_component/Footer";
import GroupNoticeModal from "./GroupNoticeModal";
import GroupInviteModal from "./GroupInviteModal";

export default function groupDetail() {
  const [isModalOpen, setIsModalOpen] = useState<
    null | "notice" | "invite" | "chat"
  >(null);
  const params = useParams();
  const groupId = params.groupId;

  return (
    <>
      <div className={style.group_detail}>
        <div className={style.group_detail_top}>
          <div>
            <h1>멋사</h1>
            <p>멋쟁이 사자처럼</p>
          </div>
          <p>린님 외 7명의 멤버가 있어요</p>
        </div>
        <div className={style.group_detail_middle}>
          <div
            className={style.group_detail_middle_left}
            onClick={() => setIsModalOpen("notice")}
          >
            <p>공지</p>
            <div>
              <h4>린</h4>
              <p>다들 낼 날씨 춥대요 따뜻하게 입고 오시오</p>
            </div>
          </div>
          <div className={style.group_detail_middle_right}>
            <div onClick={() => setIsModalOpen("invite")}>
              <p>멤버 초대</p>
              <img src="/imgs/mail.png" alt="mail" />
            </div>
            <div onClick={() => setIsModalOpen("chat")}>
              <p>그룹 채팅</p>
              <img src="/imgs/chat.png" alt="chat" />
            </div>
          </div>
        </div>
        <h1>
          <i>멋사</i>의 여행 일정
        </h1>
        <div className={style.group_detail_bottom}>
          <div>
            <div>
              <div>
                <p>2024</p>
                <div>
                  <img src="/imgs/calendar.png" alt="" />
                  <p>11/27</p> - <p>11/29</p>
                </div>
              </div>
              <div>
                <p>2일간</p>
                <p>속초</p>
                <p>3명</p>
              </div>
            </div>
            <MiniCalendar />
          </div>
          <ScheduleCheck />
        </div>
      </div>
      {isModalOpen === "notice" && (
        <GroupNoticeModal onClose={() => setIsModalOpen(null)} />
      )}
      {isModalOpen === "invite" && (
        <GroupInviteModal onClose={() => setIsModalOpen(null)} />
      )}
      {isModalOpen === "chat" && (
        <GroupChatModal onClose={() => setIsModalOpen(null)} />
      )}
      <Footer />
    </>
  );
}
