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

// ------------------ //
// CORE API CALLS
// ------------------ //

// User Products
export const getProducts = (params) => API.get("/products", { params });

export const getProductDetails = (id) => API.get(`/products/${id}`);

export const prefetchProductDetails = (id) => {
  // Fire and forget prefetch without caching logic
  API.get(`/products/${id}`).catch(() => {});
};

export const getProductImages = (id) => API.get(`/products/${id}/images`);

// Admin Products
export const getMyProducts = (params) => API.get("/products/my-products", { params });

export const createProduct = (formData) => {
  return API.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
};

export const updateProduct = (id, formData) => {
  return API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-material" },
  });
};

export const deleteProduct = (id) => API.delete(`/products/${id}`);

// User Categories
// No caching to ensure fresh data every time
export const getCategories = () => API.get("/categories");

// Admin Categories
export const createCategory = (data) => API.post("/categories", data);

export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);

export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// User Favorites
export const addToFavorites = (productId) => API.post(`/favorites/${productId}`);

export const removeFromFavorites = (productId) => API.delete(`/favorites/${productId}`);

export const getFavorites = () => API.get("/favorites");

// User Profile
export const getProfile = () => API.get("/profile");

export const updateProfile = (data) => API.put("/profile", data);

// User Cart
export const addToCart = (productId, data) => API.post(`/cart/${productId}`, data);

export const getCart = () => API.get("/cart");

export const updateCartQty = (productId, qty, data) => API.post(`/cart/${productId}/${qty}`, data);

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

// Admin Orders
export const getAdminOrders = (params) => API.get("/orders/admin/orders", { params });

export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });

//user payments
export const payOrder = (orderId) => API.post(`/payments/order/${orderId}`);

export const getMyPayments = () => API.get("/payments/my");

// Admin Dashboard
export const getDashboardOverview = (params) => API.get("/dashboard/overview", { params });

export const getRevenueAnalytics = (params) => API.get("/dashboard/revenue", { params });

export const getOrderStatistics = (params) => API.get("/dashboard/orders/stats", { params });

export const getTopProducts = (params) => API.get("/dashboard/products/top", { params });

export const getRecentOrders = (params) => API.get("/dashboard/orders/recent", { params });

export const getSalesByCategory = () => API.get("/dashboard/sales/category");

export const getPopularFavorites = () => API.get("/dashboard/favorites/popular");

export default API;
