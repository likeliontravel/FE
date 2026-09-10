import axios from "axios";

const BASE_URL = "https://api.toleave.cloud";

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
