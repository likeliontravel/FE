'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSignUpData } from '../../../util/login/authSlice';
import { RootState } from '../../../store/store';
import styles from '../../../styles/join2/join2.module.scss';
import Image from 'next/image';
import rightArrow from '../../../public/imgs/right.png';

const Terms = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const signUpData = useSelector((state: RootState) => state.auth.signUpData);

  // termsAccepted가 undefined일 경우 기본값 설정
  const termsAccepted = signUpData.termsAccepted || [];
  const [allChecked, setAllChecked] = useState(termsAccepted.every(Boolean));
  const [openDropdown, setOpenDropdown] = useState(
    Array(termsAccepted.length).fill(false)
  );

  useEffect(() => {
    setAllChecked(termsAccepted.every(Boolean));
  }, [termsAccepted]);

  const handleAllCheck = useCallback(() => {
    const newCheckState = !allChecked;
    dispatch(
      setSignUpData({
        termsAccepted: Array(termsAccepted.length).fill(newCheckState),
      })
    );
    setAllChecked(newCheckState);
  }, [allChecked, termsAccepted.length, dispatch]);

  const handleCheck = useCallback(
    (index: number) => {
      return () => {
        const newTerms = [...termsAccepted];
        newTerms[index] = !newTerms[index];
        dispatch(setSignUpData({ termsAccepted: newTerms }));
      };
    },
    [termsAccepted, dispatch]
  );

  const toggleDropdown = useCallback((index: number) => {
    return () => {
      setOpenDropdown((prev) =>
        prev.map((item, i) => (i === index ? !item : item))
      );
    };
  }, []);

  const handleNext = useCallback(() => {
    router.push('/join3');
  }, [router]);

  return (
    <div className={styles.termsContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}></div>
      </div>

      <div className={styles.termsContent}>
        <div className={styles.textSection}>
          <span className={styles.step}>
            STEP 2. <span className={styles.highlight}>이용약관</span>
          </span>
          <h2>이용약관 동의가 필요해요</h2>
          <p className={styles.notice}>* 항목은 필수 입력사항입니다</p>
        </div>

        <div className={styles.termsSection}>
          <div className={styles.allCheckWrapper}>
            <label className={styles.allCheck}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllCheck}
              />
              <span>전체 약관 동의</span>
            </label>
          </div>

          {termsAccepted.map((checked, index) => (
            <div key={`terms-${index}`} className={styles.termsItem}>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={handleCheck(index)} // ✅ 최적화된 핸들러 사용
                />
                <span className={styles.required}>[필수]</span> 이용약관
              </label>
              <button
                className={styles.dropdown}
                onClick={toggleDropdown(index)}
              >
                ▼
              </button>
              {openDropdown[index] && (
                <div className={styles.termsDetails}>
                  <p>이용약관 {index + 1} 내용...</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.nextButton}>
          <button type="button" onClick={handleNext}>
            <Image src={rightArrow} alt="다음" width={50} height={50} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
