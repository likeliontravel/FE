'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../util/login/authSlice';
import { AppDispatch, RootState } from '../../../store/store';
import Link from 'next/link';
import styles from '../../../styles/login/login.module.scss';
import { useRouter } from 'next/navigation';

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

  // ✅ useCallback을 사용하여 함수 메모이제이션
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
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(loginUser(formData));
    },
    [dispatch, formData]
  );

  useEffect(() => {
    if (user) {
      alert('로그인 성공!');
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <span>이미지</span>
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
              onChange={handleChange} // ✅ JSX 내부에서 새 함수 생성 X
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
              onChange={handleChange} // ✅ JSX 내부에서 새 함수 생성 X
              required
            />
          </div>

          <div className={styles.optionsRow}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleCheckboxChange} // ✅ JSX 내부에서 새 함수 생성 X
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
            <a href="/auth/kakao">
              <img
                src="../imgs/kakao.png"
                alt="카카오 로그인"
                className={styles.kakao}
              />
            </a>
            <a href="/auth/naver">
              <img
                src="../imgs/naver.png"
                alt="네이버 로그인"
                className={styles.naver}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
