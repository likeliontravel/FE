"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import style from "../../../../styles/group/groupDetail.module.scss";
import MiniCalendar from "../../../../util/scheduleCalendar/MiniCalendar";
import ScheduleCheck from "../../../../util/ScheduleCheck";
import Footer from "@/app/_component/Footer";
import GroupNoticeModal from "./GroupNoticeModal";
import GroupInviteModal from "./GroupInviteModal";
import UseReactSelect from "../../../../util/select/UseReactSelect";

export default function groupDetail() {
  const [isModalOpen, setIsModalOpen] = useState<null | "notice" | "invite">(
    null
  );
  const [group, setGroup] = useState<any | null>(null);
  const [notice, setNotice] = useState<any | null>(null);
  const params = useParams();
  const groupName = params.groupName;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `https://localhost:8080/group/${groupName}/detail`
        );
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGroup(json.data[0]);
        } else {
        }
      } catch (error) {
        console.error("그룹 정보 불러오기 실패:", error);
      }
    };

    const fetchNotice = async () => {
      try {
        const res = await fetch(
          `https://localhost:8080/group/announcement/latestOne?groupName=${groupName}`
        );
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setNotice(json.data[0]);
        } else {
        }
      } catch (error) {
        console.error("공지 정보 불러오기 실패:", error);
      }
    };

    fetchGroups();
    fetchNotice();
  }, []);

  return (
    <>
      {group && (
        <div className={style.group_detail}>
          <div className={style.group_detail_top}>
            <div>
              <h1>{group.groupName}</h1>
              <p>{group.groupDescription}</p>
            </div>
            <p>
              {group.createdName} 외 {group.members.length - 1}명의 멤버가
              있어요
            </p>
          </div>
          <div className={style.group_detail_middle}>
            <div
              className={style.group_detail_middle_left}
              onClick={() => setIsModalOpen("notice")}
            >
              <p>공지</p>
              <div>
                <h4>{notice?.writerName}</h4>
                <p>{notice?.content}</p>
              </div>
            </div>
            <div className={style.group_detail_middle_right}>
              <div onClick={() => setIsModalOpen("invite")}>
                <p>멤버 초대</p>
                <img src="/imgs/mail.png" alt="mail" />
              </div>
              <Link href={`/group/${groupName}/chat`}>
                <p>그룹 채팅</p>
                <img src="/imgs/chat.png" alt="chat" />
              </Link>
            </div>
          </div>
          <h1>
            <i>{group?.groupName}</i>의 여행 일정
          </h1>
          <div className={style.group_detail_bottom}>
            <div className={style.calendar_div}>
              <UseReactSelect type="calendar" />
              <MiniCalendar />
            </div>
            <ScheduleCheck />
          </div>
        </div>
      )}
      {isModalOpen === "notice" && (
        <GroupNoticeModal
          onClose={() => setIsModalOpen(null)}
          groupName={groupName}
        />
      )}
      {isModalOpen === "invite" && (
        <GroupInviteModal
          onClose={() => setIsModalOpen(null)}
          groupName={groupName}
        />
      )}
      <Footer />
    </>
  );
}
