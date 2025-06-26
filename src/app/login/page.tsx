'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../../util/login/authSlice'; // ✅ clearAuthError 추가
import { AppDispatch, RootState } from '../../../store/store';
import Link from 'next/link';
import styles from '../../../styles/login/login.module.scss';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);

  // ✅ 컴포넌트가 언마운트될 때 에러 메시지 초기화
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleCheckboxChange = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  // ✅ 로그인 핸들러 로직 수정
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // unwrap()을 사용하여 성공/실패를 구분하고, 성공 시 payload를 받아옴
        const resultAction = await dispatch(loginUser(formData)).unwrap();
        
        // 로그인 성공 시 로직
        alert(`${resultAction.user.name}님, 환영합니다!`);
        router.push('/dashboard'); // 로그인 후 이동할 페이지 (예: 대시보드 또는 메인)

      } catch (err) {
        // unwrap()은 thunk가 rejected될 때 에러를 던지므로, 여기서 캐치
        // alert(`로그인 실패: ${err}`); // 에러 메시지는 아래 error 상태로 표시
        console.error('로그인 실패:', err);
      }
    },
    [dispatch, formData, router]
  );

  const handleOAuthLogin = useCallback((provider: 'naver' | 'kakao') => {
    // 외부 인증 페이지로의 이동은 window.location.href가 적합합니다.
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

          {/* ✅ Redux 상태의 error를 사용하여 에러 메시지 표시 */}
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