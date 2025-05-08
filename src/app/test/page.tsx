'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const TestPage = () => {
  const [responseData, setResponseData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 🔹 로컬 스토리지에서 토큰 읽기
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userIdentifier = getCookie('User-Identifier'); // 쿠키에서 userIdentifier 가져오기

        if (!accessToken || !refreshToken || !userIdentifier) {
          setError('토큰 또는 사용자 식별자가 없습니다.');
          return;
        }

        // 🔹 API 요청
        const response = await axios.get(
          `https://api.toleave.shop/user/test/userInfo/${userIdentifier}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Refresh-Token': refreshToken, // Bearer 없이 전달
            },
            withCredentials: true, // 쿠키 포함 요청
          }
        );

        setResponseData(JSON.stringify(response.data, null, 2));
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError('API 요청 실패: ' + error.message);
        } else {
          setError('알 수 없는 오류 발생');
        }
      }
    };

    fetchUserInfo();
  }, []);

  // 🔹 쿠키에서 특정 값 가져오는 함수
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  return (
    <div>
      <h1>테스트 페이지</h1>
      <h3>응답 데이터:</h3>
      <pre>{responseData ? responseData : error || '로딩 중...'}</pre>
    </div>
  );
};

export default TestPage;
