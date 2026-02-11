"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  clearGroupDetail,
  fetchGroupDetail,
  fetchGroupSchedule,
} from "../../../../util/group/groupSlice";
import style from "../../../../styles/group/groupDetail.module.scss";
import MiniCalendar from "../../../../util/schedule/scheduleCalendar/MiniCalendar";
import ScheduleCheck from "../../../../util/schedule/ScheduleCheck";
import Footer from "@/app/_component/Footer";
import GroupNoticeModal from "./GroupNoticeModal";
import GroupInviteModal from "./GroupInviteModal";
import UseReactSelect from "../../../../util/select/UseReactSelect";
import { AppDispatch, RootState } from "../../../../store/store";

export default function groupDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const groupName = params.groupName as string;
  const { groupDetail } = useSelector((state: RootState) => state.group);
  const [isModalOpen, setIsModalOpen] = useState<null | "notice" | "invite">(
    null,
  );

  useEffect(() => {
    if (groupName) {
      dispatch(fetchGroupDetail(groupName));
      dispatch(fetchGroupSchedule(groupName));
    }
    return () => {
      dispatch(clearGroupDetail());
    };
  }, [dispatch, groupName]);
  const notice = groupDetail?.latestAnnouncement;

  return (
    <>
      {groupDetail && (
        <div className={style.group_detail}>
          <div className={style.group_detail_top}>
            <div>
              <h1>{groupDetail.groupName}</h1>
              <p>{groupDetail.description}</p>
            </div>
            <p>
              {groupDetail.createdName} 외 {groupDetail.members.length - 1}명의
              멤버가 있어요
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
                  query: { groupDescription: groupDetail.description },
                }}
              >
                <p>그룹 채팅</p>
                <img src="/imgs/chat.png" alt="chat" />
              </Link>
            </div>
          </div>
          <h1>
            <i>{groupDetail?.groupName}</i>의 여행 일정
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
