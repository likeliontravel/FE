'use client';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSignUpData,
  signUpUser,
  resetSignUpData,
} from '../../../../util/login/authSlice';
import { RootState, AppDispatch } from '../../../../store/store';
import styles from '../../../../styles/join3/join3.module.scss';
import Image from 'next/image';

interface Step3Props {
  onNext: () => void;
}

export default function Step3Plan({ onNext }: Step3Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { signUpData, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSelectPlan = useCallback(
    (plan: string) => {
      dispatch(setSignUpData({ selectedPlan: plan }));
    },
    [dispatch]
  );

  const handleSubmit = useCallback(async () => {
    if (!signUpData.selectedPlan) {
      alert('구독 플랜을 선택해주세요.');
      return;
    }

    // 백엔드 명세에 맞춰 policy와 subscribe 필드 추가
    const finalUserData = {
      email: signUpData.email,
      password: signUpData.password,
      name: signUpData.name,
      policy: signUpData.termsAccepted.every(Boolean),
      subscribe: signUpData.selectedPlan === 'subscribe'
    };

    try {
      await dispatch(signUpUser(finalUserData)).unwrap();
      dispatch(resetSignUpData());
      onNext(); // 가입 성공 시 Step 4(환영 화면)로 이동
    } catch (err: any) {
      alert(`회원가입 실패: ${err}`);
    }
  }, [dispatch, signUpData, onNext]);

  return (
    <div className={styles.subscriptionContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: '75%' }}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <p className={styles.step}>STEP 3. 투리브 구독</p>
          <h2>
            <span className={styles.blue}>구독 플랜</span> 사용 여부를
            <br /> 선택해주세요
          </h2>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.subscriptionOptions}>
            <div
              onClick={() => handleSelectPlan('subscribe')}
              className={`${styles.option} ${
                signUpData.selectedPlan === 'subscribe' ? styles.selected : ''
              }`}
            >
              <h3>투리브 구독플랜</h3>
              <p>
                광고 제거, AI 맞춤형 여행 계획 생성으로
                <br />
                편리한 이용이 가능해요.
              </p>
            </div>

            <div
              onClick={() => handleSelectPlan('noSubscribe')}
              className={`${styles.option} ${
                signUpData.selectedPlan === 'noSubscribe' ? styles.gray : ''
              }`}
            >
              <h3>괜찮아요, 구독 없이 진행할게요</h3>
              <p>
                지금 구독하지 않아도 언제든지
                <br />
                구독플랜 전환이 가능해요!
              </p>
            </div>
          </div>
        </div>

        <div className={styles.nextButton}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!signUpData.selectedPlan || loading}
          >
            {loading ? (
              '가입 중...'
            ) : (
              <Image src="/imgs/right.png" alt="다음" width={50} height={50} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}