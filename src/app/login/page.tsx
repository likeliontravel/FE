'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../../util/login/authSlice'; 
import { AppDispatch, RootState } from '../../../store/store';
import Link from 'next/link';
import styles from '../../../styles/login/login.module.scss';
import Image from 'next/image';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCheckboxChange = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('1. handleSubmit 시작');

      try {
        console.log('2.보낼 데이터:', formData); 
        
        const user = await dispatch(loginUser(formData)).unwrap();
        
        console.log('3. 받은 user:', user); 
        alert(`${user.name}님, 환영합니다!`);
        router.push('/main');

      } catch (err: any) {
        console.error('4. catch, 에러:', err);
      }
    },
    [dispatch, formData, router]
  );

  const handleOAuthLogin = useCallback((provider: 'naver' | 'kakao') => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/${provider}`;
  }, []);
  
  const handleKakaoLogin = useCallback(() => handleOAuthLogin('kakao'), [handleOAuthLogin]);
  const handleNaverLogin = useCallback(() => handleOAuthLogin('naver'), [handleOAuthLogin]);

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img
          src="/imgs/loginMainImg.png"
          alt="투리브 캐릭터"
          className={styles.characterImage}
        />
      </div>

      <div className={styles.formSection}>
        <h2>
          투리브와 <br />
          새로운 여정을 <br />
          함께해요
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">아이디</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              required
            />
          </div>

          <div className={styles.optionsRow}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="rememberMe">아이디 저장</label>
            </div>
            <div className={styles.links}>
              <Link href="/forgot-username">아이디 찾기</Link>
              <span> | </span>
              <Link href="/forgot-password">비밀번호 찾기</Link>
            </div>
          </div>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.registerLink}>
          <Link href="/join">회원가입</Link>
        </div>

        <div className={styles.socialLogin}>
          <p>소셜 계정으로 로그인</p>
          <div className={styles.socialButtons}>
            <button onClick={handleKakaoLogin}>
              <img src="/imgs/kakao.png" alt="카카오 로그인" className={styles.kakao} />
            </button>
            <button onClick={handleNaverLogin}>
              <img src="/imgs/naver.png" alt="네이버 로그인" className={styles.naver} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;