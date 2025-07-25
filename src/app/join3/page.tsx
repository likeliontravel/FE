'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSignUpData,
  signUpUser,
  resetSignUpData,
} from '../../../util/login/authSlice';
import { RootState, AppDispatch } from '../../../store/store';
import styles from '../../../styles/join3/join3.module.scss';
import Image from 'next/image';

const Subscription: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
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

    const finalUserData = {
      email: signUpData.email,
      password: signUpData.password,
      name: signUpData.name,
    };

    try {
      await dispatch(signUpUser(finalUserData)).unwrap();
      alert('회원가입이 완료되었습니다! 환영 페이지로 이동합니다.');
      dispatch(resetSignUpData());
      router.push('/join4');
    } catch (err) {
      alert(`회원가입 실패: ${err}`);
    }
  }, [dispatch, signUpData, router]);

  const handleSelectSubscribe = useCallback(
    () => handleSelectPlan('subscribe'),
    [handleSelectPlan]
  );

  const handleSelectNoSubscribe = useCallback(
    () => handleSelectPlan('noSubscribe'),
    [handleSelectPlan]
  );

  return (
    <div className={styles.subscriptionContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}></div>
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
              onClick={handleSelectSubscribe}
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
              onClick={handleSelectNoSubscribe}
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
};

export default Subscription;