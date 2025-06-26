'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSignUpData,
  requestEmailCode,
  verifyEmailCode,
} from '../../../util/login/authSlice';
import { RootState, AppDispatch } from '../../../store/store';
import styles from '../../../styles/join/join.module.scss';
import Image from 'next/image';

const SignUp = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { signUpData, isEmailVerified } = useSelector(
    (state: RootState) => state.auth
  );

  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSignUpData({ ...signUpData, [e.target.id]: e.target.value }));
    },
    [dispatch, signUpData]
  );

  const handleRequestCode = useCallback(async () => {
    if (!signUpData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    try {
      await dispatch(requestEmailCode({ email: signUpData.email })).unwrap();
      alert('인증 코드가 이메일로 발송되었습니다. 스팸 메일함을 확인해주세요!');
      setIsCodeSent(true);
      setIsCodeInputVisible(true);
    } catch (error) {
      alert(`코드 발송 실패: ${error}`);
    }
  }, [dispatch, signUpData.email]);

  const handleVerifyCode = useCallback(async () => {
    if (!code) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    try {
      await dispatch(
        verifyEmailCode({ email: signUpData.email, code })
      ).unwrap();
      alert('이메일 인증에 성공했습니다!');
    } catch (error) {
      alert(`인증 실패: ${error}`);
    }
  }, [dispatch, signUpData.email, code]);

  const goToNext = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isEmailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
      }
      router.push('/join2');
    },
    [router, isEmailVerified]
  );

  return (
    <div className={styles.container}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}></div>
      </div>
      <div className={styles.layout}>
        <div className={styles.infoSection}>
          <h3>
            STEP 1. <span className={styles.highlight}>회원정보</span>
          </h3>
          <h2>
            고객님의 <span className={styles.blue}>회원정보</span>를
            입력해주세요
          </h2>
          <p className={styles.notice}>* 항목은 필수 입력사항입니다</p>
        </div>

        <div className={styles.formSection}>
          <form onSubmit={goToNext}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">
                이름<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={signUpData.name}
                onChange={handleChange}
                placeholder="이름을 입력해주세요"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">
                이메일<span className={styles.required}>*</span>
              </label>
              <div className={styles.emailField}>
                <input
                  type="email"
                  id="email"
                  value={signUpData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요"
                  required
                  disabled={isEmailVerified}
                />
                <button
                  type="button"
                  className={styles.verifyButton}
                  onClick={handleRequestCode}
                  disabled={isCodeSent}
                >
                  {isCodeSent ? '재전송' : '인증 요청'}
                </button>
              </div>
            </div>

            {isCodeInputVisible && !isEmailVerified && (
              <div className={styles.inputGroup}>
                <label htmlFor="code">
                  인증 코드<span className={styles.required}>*</span>
                </label>
                <div className={styles.emailField}>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="인증 코드를 입력해주세요"
                  />
                  <button
                    type="button"
                    className={styles.verifyButton}
                    onClick={handleVerifyCode}
                  >
                    인증 확인
                  </button>
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="password">
                비밀번호<span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="password"
                value={signUpData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요"
                required
              />
              <p className={styles.hint}>영문+숫자 · 8~16자</p>
            </div>

            <div className={styles.nextButton}>
              <button type="submit">
                <Image src="/imgs/right.png" alt="다음" width={50} height={50} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;