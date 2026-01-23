import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.5.47:3000",
  withCredentials: true,
});

// auth 
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

export const verifyForgotOtp = (otp) =>
  API.post("/auth/verify-forgot-otp", { otp });

export const resetPassword = (newPassword) =>
  API.post("/auth/reset-password", { newPassword });



// products
export const getProducts = () => API.get("/products");
// admin products
export const getMyProducts = () => API.get("/products/my-products");
export const createProduct = (formData) =>
  API.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// categories
export const getCategories = () => API.get("/categories");
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export default API;
