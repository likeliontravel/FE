"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { updatePassword } from "../../util/login/authSlice";
import style from "./passwordChangeModal.module.scss";

interface PasswordChangeModalProps {
  onClose: () => void;
}

export default function PasswordChangeModal({
  onClose,
}: PasswordChangeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("비밀번호는 8자리 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const actionResult = await dispatch(
        updatePassword({ email: user?.email, password: newPassword }),
      );
      if (updatePassword.fulfilled.match(actionResult)) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        onClose();
      }
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.modal_overlay}>
      <div className={style.modal_content}>
        <h2>비밀번호 변경 안내</h2>
        <p>
          현재 비밀번호 변경 주기가 지났습니다.
          <br />
          안전한 서비스 이용을 위해 비밀번호를 변경해 주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="새 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className={style.btn_group}>
            <button
              type="button"
              onClick={onClose}
              className={style.cancel_btn}
              disabled={isSubmitting}
            >
              다음에 하기
            </button>
            <button
              type="submit"
              className={style.submit_btn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
