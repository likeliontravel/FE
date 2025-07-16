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
  console.log('--- SignUp 컴포넌트 렌더링 ---'); // 1. 렌더링 확인

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { signUpData, isEmailVerified, error, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(`handleChange: ${e.target.id} = ${e.target.value}`); // 2. 입력값 변경 확인
      dispatch(setSignUpData({ ...signUpData, [e.target.id]: e.target.value }));
    },
    [dispatch, signUpData]
  );

  const handleRequestCode = useCallback(async () => {
    console.log('--- "인증 요청" 버튼 클릭 ---'); // 3. 버튼 클릭 확인
    if (!signUpData.email) {
      alert('이메일을 입력해주세요.');
      console.error('이메일이 비어있음');
      return;
    }
    
    console.log(`[디버그] requestEmailCode 액션 디스패치 시작. 이메일: ${signUpData.email}`); // 4. 액션 디스패치 확인

    try {
      const result = await dispatch(requestEmailCode({ email: signUpData.email })).unwrap();
      console.log('[디버그] requestEmailCode 성공:', result); // 5. 성공 시 결과 확인
      alert('인증 코드가 이메일로 발송되었습니다. 스팸 메일함을 확인해주세요!');
      setIsCodeSent(true);
      setIsCodeInputVisible(true);
    } catch (err) {
      console.error('[디버그] requestEmailCode 실패:', err); // 6. 실패 시 에러 확인
      alert(`코드 발송 실패: ${err}`);
    }
  }, [dispatch, signUpData.email]);

  const handleVerifyCode = useCallback(async () => {
    console.log('--- "인증 확인" 버튼 클릭 ---');
    if (!code) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    console.log(`[디버그] verifyEmailCode 액션 디스패치 시작. 이메일: ${signUpData.email}, 코드: ${code}`);
    try {
      const result = await dispatch(
        verifyEmailCode({ email: signUpData.email, code })
      ).unwrap();
      console.log('[디버그] verifyEmailCode 성공:', result);
      alert('이메일 인증에 성공했습니다!');
    } catch (err) {
      console.error('[디버그] verifyEmailCode 실패:', err);
      alert(`인증 실패: ${err}`);
    }
  }, [dispatch, signUpData.email, code]);

  const goToNext = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log('--- "다음" 버튼 클릭 ---');
      console.log(`[디버그] 이메일 인증 상태 (isEmailVerified): ${isEmailVerified}`);
      if (!isEmailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
      }
      router.push('/join2');
    },
    [router, isEmailVerified]
  );
  
  console.log('[디버그] 현재 Redux 상태:', { signUpData, isEmailVerified, error, loading }); // 7. Redux 상태 변화 확인

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