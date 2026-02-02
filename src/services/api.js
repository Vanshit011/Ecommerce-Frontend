import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
});
// ------------------ //
// API'S //
// ------------------ //

// auth user & admin
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
  (error) => Promise.reject(error),
);
export const logout = () => API.post("/auth/logout");

export const forgotPassword = (data) => API.post("/auth/forgot-password", data);

export const verifyForgotOtp = (otp) => API.post("/auth/verify-forgot-otp", { otp });

export const resetPassword = (newPassword) => API.post("/auth/reset-password", { newPassword });

//user products //
export const getProducts = (params) => API.get("/products", { params });

export const getProductDetails = (id) => API.get(`/products/${id}`);

export const getProductImages = (id) => API.get(`/products/${id}/images`);

//admin products //
export const getMyProducts = (params) => API.get("/products/my-products", { params });

export const createProduct = (formData) => API.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" }, });

export const updateProduct = (id, formData) => API.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" }, });

export const deleteProduct = (id) => API.delete(`/products/${id}`);

//user categories  //
export const getCategories = () => API.get("/categories");

//admin categories  //
export const createCategory = (data) => API.post("/categories", data);

export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);

export const deleteCategory = (id) => API.delete(`/categories/${id}`);

//user favorites  //
export const addToFavorites = (productId) => API.post(`/favorites/${productId}`);

export const removeFromFavorites = (productId) => API.delete(`/favorites/${productId}`);

export const getFavorites = () => API.get("/favorites");

//user profile  //
export const getProfile = () => API.get("/profile");

export const updateProfile = (data) => API.put("/profile", data);

//user Cart //
export const addToCart = (productId) => API.post(`/cart/${productId}`);

export const getCart = () => API.get("/cart");

export const updateCartQty = (productId, qty) => API.post(`/cart/${productId}/${qty}`);

export const clearCart = () => API.delete("/cart");

//user address
export const getAddresses = () => API.get("/address");

export const createAddress = (data) => API.post("/address", data);

export const updateAddress = (id, data) => API.put(`/address/${id}`, data);

export const deleteAddress = (id) => API.delete(`/address/${id}`);

export const setDefaultAddress = (id) => API.put(`/address/${id}/default`);

//user order
export const createOrder = () => API.post("/orders");

export const getOrderById = (id) => API.get(`/orders/${id}`);

export const getMyOrders = () => API.get(`/orders/my`);

export const cancelMyOrder = (orderId) => API.patch(`/orders/${orderId}/cancel`);

//user payments
export const payOrder = (orderId) => API.post(`/payments/order/${orderId}`);

export const getMyPayments = () => API.get("/payments/my");

export default API;
