'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../util/login/authSlice';
import { AppDispatch, RootState } from '../../../store/store';
import Link from 'next/link';
import styles from '../../../styles/login/login.module.scss';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, successMessage, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleCheckboxChange = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await dispatch(loginUser(formData)).unwrap();
        const { accessToken, refreshToken } = response.data || {};

        if (accessToken && refreshToken) {
          setCookie('Authorization', accessToken, {
            path: '/',
            maxAge: 60 * 60,
          });
          setCookie('Refresh-Token', refreshToken, {
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });

          localStorage.setItem('Authorization', accessToken);
          localStorage.setItem('Refresh-Token', refreshToken);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('로그인 실패:', error);
      }
    },
    [dispatch, formData]
  );

  useEffect(() => {
    if (user) {
      alert('로그인 성공!');
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleOAuthLogin = useCallback((provider: 'naver' | 'kakao') => {
    window.location.href = `https://api.toleave.shop/auth/${provider}`;
  }, []);

  const handleKakaoLogin = useCallback(
    () => handleOAuthLogin('kakao'),
    [handleOAuthLogin]
  );
  const handleNaverLogin = useCallback(
    () => handleOAuthLogin('naver'),
    [handleOAuthLogin]
  );

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
          {successMessage && (
            <p className={styles.successMessage}>{successMessage}</p>
          )}

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
              <img
                src="../imgs/kakao.png"
                alt="카카오 로그인"
                className={styles.kakao}
              />
            </button>
            <button onClick={handleNaverLogin}>
              <img
                src="../imgs/naver.png"
                alt="네이버 로그인"
                className={styles.naver}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
