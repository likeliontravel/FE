"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  clearGroupDetail,
  fetchGroupDetail,
  updateGroupDescription,
  deleteGroup,
  leaveGroup,
  fetchLatestGroupNotice,
} from "../../../../util/group/groupSlice";
import style from "../../../../styles/group/groupDetail.module.scss";
import ScheduleCheck from "../../../../util/schedule/ScheduleCheck";
import Footer from "@/app/_component/Footer";
import GroupNoticeModal from "./GroupNoticeModal";
import GroupInviteModal from "./GroupInviteModal";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchScheduleDetails } from "../../../../util/schedule/scheduleSlice";

export default function groupDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const route = useRouter();
  const groupName = params.groupName as string;

  const { user } = useSelector((state: RootState) => state.auth);
  const { groupDetail, latestNotice } = useSelector(
    (state: RootState) => state.group,
  );
  const [isModalOpen, setIsModalOpen] = useState<null | "notice" | "invite">(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreator =
    user && groupDetail ? user.name === groupDetail.createdName : false;

  const handleEditDescriptionClick = async () => {
    if (isSubmitting || !groupDetail) return;

    const newDescription = prompt(
      "변경할 그룹 설명을 입력해주세요:",
      groupDetail.description || "",
    );

    if (newDescription === null) return;
    if (!newDescription.trim()) {
      alert("그룹 설명은 한 글자 이상 입력해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const actionResult = await dispatch(
        updateGroupDescription({
          groupName,
          description: newDescription.trim(),
        }),
      );

      if (updateGroupDescription.fulfilled.match(actionResult)) {
        alert("그룹 설명이 성공적으로 변경되었습니다.");
      } else {
        alert(`설명 변경 실패: ${actionResult.payload}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (groupName) {
      dispatch(fetchGroupDetail(groupName));
      dispatch(fetchLatestGroupNotice(groupName));
      dispatch(fetchScheduleDetails(groupName));
    }
    return () => {
      dispatch(clearGroupDetail());
    };
  }, [dispatch, groupName]);

  const notice = latestNotice;

  const handleDeleteGroupClick = async () => {
    if (isSubmitting) return;

    if (
      !confirm(
        `정말로 '${groupName}' 그룹을 삭제하시겠습니까?\n이 그룹의 모든 일정과 데이터가 영구 삭제되며 복구할 수 없습니다.`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const actionResult = await dispatch(deleteGroup(groupName));

      if (deleteGroup.fulfilled.match(actionResult)) {
        alert("그룹이 정상적으로 삭제되었습니다.");
        route.push("/");
      } else {
        alert(`그룹 삭제 실패: ${actionResult.payload}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleLeaveGroupClick = async () => {
    if (isSubmitting) return;

    if (
      !confirm(
        `'${groupName}' 그룹에서 나가시겠습니까?\n나간 이후에는 그룹원들이 다시 초대해 주기 전까지 진입할 수 없습니다.`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const actionResult = await dispatch(leaveGroup(groupName));

      if (leaveGroup.fulfilled.match(actionResult)) {
        alert("그룹이 삭제되었습니다.");
        route.push("/");
      } else {
        alert(`그룹 나가기 실패: ${actionResult.payload}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {groupDetail && (
        <div className={style.group_detail}>
          <div className={style.group_detail_top}>
            <div className={style.left_info}>
              <h1>{groupDetail.groupName}</h1>
              <p>{groupDetail.description}</p>
            </div>
            <div className={style.right_actions}>
              <div className={style.btn_wrapper}>
                <button
                  className={style.edit_desc_btn}
                  onClick={handleEditDescriptionClick}
                >
                  그룹설명 변경
                </button>

                {isCreator ? (
                  <button
                    className={style.delete_group_btn}
                    onClick={handleDeleteGroupClick}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "삭제 중..." : "그룹 삭제"}
                  </button>
                ) : (
                  <button
                    className={style.leave_group_btn}
                    onClick={handleLeaveGroupClick}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "처리 중..." : "그룹 나가기"}
                  </button>
                )}
              </div>

              <p className={style.member_count}>
                {groupDetail.createdName} 외 {groupDetail.members.length - 1}
                명의 멤버가 있어요
              </p>
            </div>
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
              <Link href={`/group/${groupName}/chat`}>
                <p>그룹 채팅</p>
                <img src="/imgs/chat.png" alt="chat" />
              </Link>
            </div>
          </div>
          <h1>
            <i>{groupDetail?.groupName}</i>의 여행 일정
          </h1>
          <div className={style.group_detail_bottom}>
            {/* <div className={style.calendar_div}>
              <UseReactSelect type="calendar" />
              <MiniCalendar />
            </div> */}
            <ScheduleCheck groupName={groupName} />
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
