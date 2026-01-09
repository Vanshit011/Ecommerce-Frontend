import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// AUTH APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (email, otp, newPassword) =>
  API.post("/auth/reset-password", { email, otp, newPassword });

export default API;
