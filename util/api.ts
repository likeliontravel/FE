import axios from "axios";

const BASE_URL = "https://api.toleave.cloud";

// 공용 Axios 인스턴스
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // "Bearer " 중복 방지 로직 포함
      const cleanedToken = token.startsWith("Bearer ")
        ? token.split(" ")[1]
        : token;
      config.headers.Authorization = `Bearer ${cleanedToken}`;
    }
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도(retry)를 안 했을 때 실행
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        // 토큰 재발급 요청
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // 실패했던 원래 요청을 재요청
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // 로그아웃 처리
        return Promise.reject(refreshError);
      }
    }

    // 401 이외의 에러는 그대로 반환
    return Promise.reject(error);
  },
);

// 로그인/회원가입 등 토큰이 필요 없는 요청
export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
