"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "../../../../styles/mypage/modify.module.scss";
import { RootState, AppDispatch } from "../../../../store/store";
import {
  fetchMyPageInfo,
  updateUserName,
  updateProfileImage,
  deleteProfileImage,
  withdrawUser,
} from "../../../../util/mypage/mypageSlice";

import { fetchUserName } from "../../../../util/login/authSlice";

export default function ModifyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { userInfo } = useSelector((state: RootState) => state.mypage);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const [isNameUpdating, setIsNameUpdating] = useState(false);
  const [isImgUpdating, setIsImgUpdating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userInfo) {
      dispatch(fetchMyPageInfo());
    } else {
      setEditName(userInfo.name);
    }
  }, [dispatch, userInfo]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    setIsNameUpdating(true);
    try {
      await dispatch(updateUserName(editName)).unwrap();
      dispatch(fetchUserName(editName));
      setIsEditing(false);
      alert("닉네임이 성공적으로 변경되었습니다.");
    } catch (error) {
      alert("닉네임 변경에 실패했습니다.");
    } finally {
      setIsNameUpdating(false);
    }
  };

  const handleImageClick = () => {
    if (!isImgUpdating) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImgUpdating(true);
      try {
        await dispatch(updateProfileImage(file)).unwrap();
        alert("프로필 이미지가 변경되었습니다.");
      } catch (error) {
        alert("이미지 변경에 실패했습니다.");
      } finally {
        setIsImgUpdating(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async () => {
    if (confirm("프로필 사진을 삭제하고 기본 이미지로 변경하시겠습니까?")) {
      setIsImgUpdating(true);
      try {
        await dispatch(deleteProfileImage()).unwrap();
        alert("기본 프로필로 변경되었습니다.");
      } catch (error) {
        alert("프로필 삭제에 실패했습니다.");
      } finally {
        setIsImgUpdating(false);
      }
    }
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) return;

    if (
      confirm(
        "정말로 탈퇴하시겠습니까? 모든 정보가 삭제되며 복구할 수 없습니다.",
      )
    ) {
      setIsWithdrawing(true);
      try {
        await dispatch(withdrawUser()).unwrap();

        alert("회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");

        router.push("/");
      } catch (error) {
        alert("회원 탈퇴 처리에 실패했습니다.");
        setIsWithdrawing(false);
      }
    }
  };

  return (
    <div className={style.container}>
      <div className={style.big_div}>
        <h2>마이페이지</h2>
        <div className={style.mypage_div}>
          <div className={style.left_modify}>
            <div className={style.img}>
              <div className={style.img_wrapper}>
                <img
                  className={style.profile_img}
                  src={userInfo?.profileImageUrl || "/imgs/default-profile.png"}
                  alt="프로필"
                  style={{ opacity: isImgUpdating ? 0.5 : 1 }}
                />
                {isImgUpdating && (
                  <span className={style.loading_text}>변경 중...</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <img
                className={style.modify}
                src="/imgs/프로필 수정.png"
                alt="프로필 수정"
                onClick={handleImageClick}
                style={{
                  cursor: isImgUpdating ? "wait" : "pointer",
                  opacity: isImgUpdating ? 0.5 : 1,
                }}
              />
              {userInfo?.profileImageUrl && (
                <button
                  className={style.delete_img_btn}
                  onClick={handleDeleteImage}
                  disabled={isImgUpdating}
                >
                  기본 이미지로 변경
                </button>
              )}
              <p className={style.name}>{userInfo?.name}</p>
            </div>
            <div className={style.left_modify_nav}>
              <div className={style.select_nav}>
                <img src="/imgs/bar_icon.png" alt="icon" />
                <p>내 정보 관리</p>
              </div>
              <div>
                <img src="/imgs/bar_icon_2.png" alt="icon" />
                <p>구독 결제 내역</p>
              </div>
              <div>
                <img src="/imgs/bar_icon_3.png" alt="icon" />
                <p>그룹 및 일정</p>
              </div>
            </div>
          </div>
          <div className={style.mypage_content}>
            <h3>내 정보 관리</h3>
            <div className={style.mypage_content_div}>
              <div className={style.user}>
                <div className={style.user_modify}>
                  <p>기본 회원 정보</p>
                  {isEditing ? (
                    <button
                      onClick={handleSaveProfile}
                      className={`${style.save_btn} ${isNameUpdating ? style.loading_btn : ""}`}
                      disabled={isNameUpdating}
                    >
                      {isNameUpdating ? "저장 중..." : "수정 완료"}
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)}>
                      회원 정보 수정
                    </button>
                  )}
                </div>

                <div className={style.user_box}>
                  <div className={style.user_box_left}>
                    <div className={style.user_box_left_top}>
                      <p className={style.name}>닉네임</p>
                      {isEditing ? (
                        <div className={style.input_wrapper}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={style.edit_input}
                            disabled={isNameUpdating}
                          />
                        </div>
                      ) : (
                        <p className={style.p}>{userInfo?.name || "-"}</p>
                      )}
                    </div>

                    <div className={style.user_box_left_bottom}>
                      <p className={style.email}>이메일</p>
                      {isEditing ? (
                        <div className={style.input_wrapper}>
                          <input
                            type="email"
                            value={userInfo?.email || ""}
                            disabled
                            className={style.edit_input_disabled}
                          />
                          <span className={style.email_verified_text}>
                            이메일이 확인되었어요
                          </span>
                        </div>
                      ) : (
                        <p className={style.p}>{userInfo?.email || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className={style.social}>
                <div className={style.social_div}>
                  <div className={style.social_div_left}>
                    <p className={style.social_account}>연동 계정 관리</p>
                    <p className={style.social_get}>
                      현재 <i>0</i>의 연동계정 보유
                    </p>
                  </div>
                  <div className={style.social_img}>
                    <img src="" alt="social" />
                    <img src="/imgs/plus_btn.png" alt="social" />
                  </div>
                </div>
              </div> */}
              <div className={style.agree}>
                <p>이용 약관 동의 여부</p>
                <div>약관보기 &gt;</div>
              </div>
              <div className={style.subscription}>
                <div className={style.subscription_left}>
                  <p className={style.isPlan}>구독 플랜 여부</p>
                  <p className={style.isPlan_answer}>X</p>
                  <p className={style.next_plan}>다음 결제일 : </p>
                </div>
                <div className={style.subscription_right}>구독하기 &gt;</div>
              </div>

              <div className={style.withdraw_section}>
                <span
                  className={style.withdraw_btn}
                  onClick={handleWithdraw}
                  style={{
                    cursor: isWithdrawing ? "wait" : "pointer",
                    opacity: isWithdrawing ? 0.5 : 1,
                  }}
                >
                  {isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
