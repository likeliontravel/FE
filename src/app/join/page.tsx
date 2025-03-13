'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSignUpData } from '../../../util/login/authSlice';
import { RootState, AppDispatch } from '../../../store/store';
import styles from '../../../styles/join/join.module.scss';
import Image from 'next/image';
import rightArrow from '../../../public/imgs/right.png';

const SignUp = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const signUpData = useSelector((state: RootState) => state.auth.signUpData);

  // 입력 변경 핸들러
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSignUpData({ ...signUpData, [e.target.id]: e.target.value }));
    },
    [dispatch, signUpData]
  );

  // 다음 단계로 이동
  const goToNext = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push('/join2');
    },
    [router]
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
                />
                <button type="button" className={styles.verifyButton}>
                  중복 확인
                </button>
              </div>
            </div>

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
                <Image src={rightArrow} alt="다음" width={50} height={50} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
