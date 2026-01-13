import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// AUTH APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // console.log("Interceptor token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export const logout = () => API.post("/auth/logout");

export const forgotPassword = (data) =>
  API.post("/auth/forgot-password", data);

export const resetPassword = (otp, newPassword) =>
  API.post("/auth/reset-password", {  otp, newPassword });

export default API;
