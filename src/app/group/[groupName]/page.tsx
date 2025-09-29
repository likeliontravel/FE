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
  const [schedule, setSchedule] = useState<any | null>(null);
  const [notice, setNotice] = useState<any | null>(null);
  const params = useParams();
  const groupName = params.groupName as string;

  useEffect(() => {
      const token = localStorage.getItem("accessToken");

    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `https://172.31.45.175:8080/group/${groupName}/detail`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();

        if (json.success) {
          setGroup(json.data);
          setNotice(json.data.latestAnnouncement);
        }
      } catch (error) {
        console.error("그룹 정보 불러오기 실패:", error);
      }
    };
    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `https://172.31.45.175:8080/schedule/get/${groupName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();

        if (json.success) {
          setSchedule(json.data);
        }
      } catch (error) {
        console.error("일정 불러오기 실패:", error);
      }
    };

    fetchGroups();
    fetchSchedule();
  }, []);

  return (
    <>
      {group && (
        <div className={style.group_detail}>
          <div className={style.group_detail_top}>
            <div>
              <h1>{group.groupName}</h1>
              <p>{group.description}</p>
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
              {notice ? (
                <div className={style.notice}>
                  <h4>{notice.writerName}</h4>
                  <p>{notice.content}</p>
                </div>
              ) : (
                <div className={style.notice}>
                  <p>공지가 없습니다</p>
                </div>
              )}
            </div>
            <div className={style.group_detail_middle_right}>
              <div onClick={() => setIsModalOpen("invite")}>
                <p>멤버 초대</p>
                <img src="/imgs/mail.png" alt="mail" />
              </div>
              <Link
                href={{
                  pathname: `/group/${groupName}/chat`,
                  query: { groupDescription: group.description },
                }}
              >
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
