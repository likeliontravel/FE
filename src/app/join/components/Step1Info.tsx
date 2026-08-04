'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSignUpData,
  requestEmailCode,
  verifyEmailCode,
} from '../../../../util/login/authSlice';
import { RootState, AppDispatch } from '../../../../store/store';
import styles from '../../../../styles/join/join.module.scss';
import Image from 'next/image';

interface Step1Props {
  onNext: () => void;
}

export default function Step1Info({ onNext }: Step1Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { signUpData, isEmailVerified, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      dispatch(setSignUpData({ [id]: value }));
    },
    [dispatch]
  );

  // 1. 이메일 인증 코드 요청
  const handleRequestCode = useCallback(async () => {
    if (!signUpData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    try {
      const payload = { email: signUpData.email };
      // 백엔드 성공 메시지("이메일 코드 받기 성공 : ...") 받기
      const res = await dispatch(requestEmailCode(payload)).unwrap();
      alert(res.message || '인증 코드가 이메일로 발송되었습니다.');
      setIsCodeSent(true);
      setIsCodeInputVisible(true);
    } catch (err: any) {
      // 백엔드 실패 메시지("Mail 서버 연결 실패" 등) 팝업 출력
      alert(err || '코드 발송에 실패했습니다.');
    }
  }, [dispatch, signUpData.email]);

  // 2. 인증 코드 검사
  const handleVerifyCode = useCallback(async () => {
    if (!code) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    
    try {
      const payload = { email: signUpData.email, code: code };
      // 백엔드 성공 메시지("이메일 인증 성공") 받기
      const res = await dispatch(verifyEmailCode(payload)).unwrap();
      alert(res.message || '이메일 인증에 성공했습니다!');
    } catch (err: any) {
      // 백엔드 에러 메시지("인증 코드가 만료 되었습니다.", "인증코드가 다릅니다." 등) 출력
      alert(err || '인증에 실패했습니다.');
    }
  }, [dispatch, signUpData.email, code]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isEmailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
      }
      onNext();
    },
    [isEmailVerified, onNext]
  );

  return (
    <div className={styles.container}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: '25%' }}></div>
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
          <form onSubmit={handleSubmit}>
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
                  /* ✋🏻 요구사항 반영: 인증 요청 시 이메일 수정 불가(잠금) */
                  disabled={isCodeSent || isEmailVerified}
                />
                <button
                  type="button"
                  className={styles.verifyButton}
                  onClick={handleRequestCode}
                  disabled={loading || isEmailVerified}
                >
                  {isCodeSent ? '재전송' : '인증 요청'}
                </button>
              </div>
              {isCodeSent && (
                <p className={styles.hint} style={{ color: '#ff6b6b', marginTop: '4px' }}>
                  * 메일이 오지 않을 경우 스팸 메일함도 확인해주세요.
                </p>
              )}
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
                    disabled={loading}
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
}