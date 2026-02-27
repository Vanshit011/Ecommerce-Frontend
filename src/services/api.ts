import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  Product,
  Category,
  User,
  Review,
  Coupon,
  Address,
  Order,
  ApiResponse,
  CartItem,
  Payment,
  CartData,
} from "../types";

const API: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API || "http://localhost:3000",
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
});
// ------------------ //
// API'S //
// ------------------ //

// auth user & admin
export const registerAdmin = (data: any) =>
  API.post<ApiResponse<any>>("/auth/register/admin", data);
export const registerUser = (data: any) => API.post<ApiResponse<any>>("/auth/register/user", data);
export const loginUser = (data: any) =>
  API.post<ApiResponse<{ token: string; user: User }>>("/auth/login", data);

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    // console.log("Interceptor token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
export const logout = () => API.post<ApiResponse<any>>("/auth/logout");

export const forgotPassword = (data: { email?: string; mobile?: string }) =>
  API.post<ApiResponse<any>>("/auth/forgot-password", data);

export const verifyForgotOtp = (otp: string) =>
  API.post<ApiResponse<any>>("/auth/verify-forgot-otp", { otp });

export const resetPassword = (newPassword: string) =>
  API.post<ApiResponse<any>>("/auth/reset-password", { newPassword });

// ------------------ //
// CORE API CALLS
// ------------------ //

// User Products
export const getProducts = (params?: any) =>
  API.get<ApiResponse<Product[]>>("/products", { params });

export const getProductDetails = (id: string) => API.get<ApiResponse<Product>>(`/products/${id}`);

export const prefetchProductDetails = (id: string) => {
  // Fire and forget prefetch without caching logic
  API.get(`/products/${id}`).catch(() => {});
};

export const getProductImages = (id: string) =>
  API.get<ApiResponse<string[]>>(`/products/${id}/images`);

// Admin Products
export const getMyProducts = (params?: any) =>
  API.get<ApiResponse<Product[]>>("/products/my-products", { params });

export const createProduct = (formData: FormData) => {
  return API.post<ApiResponse<Product>>("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProduct = (id: string, formData: FormData) => {
  return API.put<ApiResponse<Product>>(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProduct = (id: string) => API.delete<ApiResponse<any>>(`/products/${id}`);

//admin variants
export const addVariant = (productId: string, data: any) =>
  API.post<ApiResponse<Product>>(`/products/${productId}/variants`, data);

export const updateProductVariants = (productId: string, variantId: string, data: any) =>
  API.put<ApiResponse<Product>>(`/products/${productId}/variants/${variantId}`, data);

export const bulkUpdateVariants = (productId: string, data: any) =>
  API.patch<ApiResponse<Product>>(`/products/${productId}/variants`, data);

export const deleteVariant = (productId: string, variantId: string) =>
  API.delete<ApiResponse<Product>>(`/products/${productId}/variants/${variantId}`);

// User Categories
// No caching to ensure fresh data every time
export const getCategories = () => API.get<ApiResponse<Category[]>>("/categories");

// Admin Categories
export const createCategory = (data: { name: string; parentId?: string }) =>
  API.post<ApiResponse<Category>>("/categories", data);

export const updateCategory = (id: string, data: { name: string; parentId?: string }) =>
  API.put<ApiResponse<Category>>(`/categories/${id}`, data);

export const deleteCategory = (id: string) => API.delete<ApiResponse<any>>(`/categories/${id}`);

// User Favorites
export const addToFavorites = (productId: string) =>
  API.post<ApiResponse<any>>(`/favorites/${productId}`);

export const removeFromFavorites = (productId: string) =>
  API.delete<ApiResponse<any>>(`/favorites/${productId}`);

export const getFavorites = () => API.get<ApiResponse<Product[]>>("/favorites");

// User Profile
export const getProfile = () => API.get<ApiResponse<User>>("/profile");

export const updateProfile = (data: any) => API.put<ApiResponse<User>>("/profile", data);

// User Cart
export const addToCart = (productId: string, data: { variantId?: string; quantity: number }) =>
  API.post<ApiResponse<any>>(`/cart/${productId}`, data);

export const getCart = () => API.get<ApiResponse<CartData>>("/cart");

export const updateCartQty = (productId: string, qty: number, variantId?: string) =>
  API.post<ApiResponse<any>>(
    `/cart/${productId}/${qty}${variantId ? `?variantId=${variantId}` : ""}`,
  );

export const removeCartItem = (productId: string, variantId?: string) =>
  API.delete<ApiResponse<any>>(`/cart/${productId}${variantId ? `?variantId=${variantId}` : ""}`);

export const clearCart = () => API.delete<ApiResponse<any>>("/cart");

//user address
export const getAddresses = () => API.get<ApiResponse<Address[]>>("/address");

export const createAddress = (data: any) => API.post<ApiResponse<Address>>("/address", data);

export const updateAddress = (id: string, data: any) =>
  API.put<ApiResponse<Address>>(`/address/${id}`, data);

export const deleteAddress = (id: string) => API.delete<ApiResponse<any>>(`/address/${id}`);

export const setDefaultAddress = (id: string) =>
  API.put<ApiResponse<Address>>(`/address/${id}/default`);

//user order
export const createOrder = () => API.post<ApiResponse<Order>>("/orders");

export const getOrderById = (id: string) => API.get<ApiResponse<Order>>(`/orders/${id}`);

export const getMyOrders = () => API.get<ApiResponse<Order[]>>(`/orders/my`);

export const cancelMyOrder = (orderId: string) =>
  API.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel`);

// Admin Orders
export const getAdminOrders = (params?: any) =>
  API.get<ApiResponse<Order[]>>("/orders/admin/orders", { params });

export const updateOrderStatus = (id: string, status: string) =>
  API.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });

//user payments
export const payOrder = (orderId: string) =>
  API.post<ApiResponse<{ clientSecret: string }>>(`/payments/order/${orderId}`);

export const getMyPayments = () => API.get<ApiResponse<Payment[]>>("/payments/my");

// Admin Dashboard
export const getDashboardOverview = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/overview", { params });

export const getRevenueAnalytics = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/revenue", { params });

export const getOrderStatistics = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/orders/stats", { params });

export const getTopProducts = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/products/top", { params });

export const getRecentOrders = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/orders/recent", { params });

export const getSalesByCategory = (params?: any) =>
  API.get<ApiResponse<any>>("/dashboard/sales/category", { params });

export const getPopularFavorites = () => API.get<ApiResponse<any>>("/dashboard/favorites/popular");

// Product Reviews
export const createReview = (productId: string, data: { rating: number; comment: string }) =>
  API.post<ApiResponse<Review>>(`/reviews/${productId}`, data);

export const getReviewsByProduct = (productId: string) =>
  API.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);

export const getProductStats = (productId: string) =>
  API.get<ApiResponse<any>>(`/reviews/product/${productId}/stats`);

export const updateReview = (id: string, data: { rating: number; comment: string }) =>
  API.patch<ApiResponse<Review>>(`/reviews/${id}`, data);

export const deleteReview = (id: string) => API.delete<ApiResponse<any>>(`/reviews/${id}`);

// AI Features
export const generateMetadata = (data: any) =>
  API.post<ApiResponse<any>>("/products/generate-metadata", data);

export const getProductRecommendations = (id: string) =>
  API.get<ApiResponse<Product[]>>(`/products/${id}/recommendations`);

// ------------------ //
// COUPONS
// ------------------ //

// User - validate a coupon code against a cart total
export const validateCoupon = (code: string, cartTotal: number) =>
  API.post<ApiResponse<Coupon>>("/coupons/validate", { code, cartTotal });

// User - apply a coupon to the current cart
export const applyCouponToCart = (data: { code: string }) =>
  API.post<ApiResponse<any>>("/cart/apply-coupon", data);

// User - remove the applied coupon from the current cart
export const removeCouponFromCart = () => API.patch<ApiResponse<any>>("/cart/remove-coupon");

// Admin - create a new coupon
export const createCoupon = (data: any) => API.post<ApiResponse<Coupon>>("/coupons", data);

// Admin & User - list all coupons
export const getAllCoupons = () => API.get<ApiResponse<Coupon[]>>("/coupons");

// Admin - update a coupon
export const updateCoupon = (id: string, data: any) =>
  API.patch<ApiResponse<Coupon>>(`/coupons/${id}`, data);

// Admin - delete a coupon
export const deleteCoupon = (id: string) => API.delete<ApiResponse<any>>(`/coupons/${id}`);

export default API;
