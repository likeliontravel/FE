'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../../styles/join3/join3.module.scss'; // 필요 시 스타일 변경 가능

export default function Step4Complete() {
  const router = useRouter();

  return (
    <div className={styles.subscriptionContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: '100%' }}></div>
      </div>

      <div className={styles.content} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '400px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
          🎉 <span className={styles.blue}>회원가입</span>이 완료되었습니다!
        </h2>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
          투리브의 회원이 되신 것을 진심으로 환영합니다.
          <br />
          로그인 후 맞춤형 여행 플랫폼 서비스를 이용해 보세요.
        </p>

        <button
          type="button"
          onClick={() => router.push('/login')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#3a7bd5',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          로그인하러 가기
        </button>
      </div>
    </div>
  );
}