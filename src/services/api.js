import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
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

// products //

// get all products
export const getProducts = (params) => API.get("/products", { params });
// get product details
export const getProductDetails = (id) => API.get(`/products/${id}`);
// get product images
export const getProductImages = (id) => API.get(`/products/${id}/images`);

// admin get personal products
export const getMyProducts = () => API.get("/products/my-products");

// create product
export const createProduct = (formData) =>
  API.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
// update product
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
//delete product
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// categories  //

// get categories
export const getCategories = () => API.get("/categories");
//create category 
export const createCategory = (data) => API.post("/categories", data);
//update category
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
// delete category
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// favorites  //

// Add product to favorites
export const addToFavorites = (productId) =>
  API.post(`/favorites/${productId}`);

// Remove product from favorites
export const removeFromFavorites = (productId) =>
  API.delete(`/favorites/${productId}`);

// Get all favorites
export const getFavorites = () =>
  API.get("/favorites");

// profile  //

// Get user profile
export const getProfile = () =>
  API.get("/profile");
//update user profile
export const updateProfile = (data) =>
  API.put("/profile", data);

// Cart //

// add to cart
export const addToCart = (productId) => API.post(`/cart/${productId}`);
// get cart
export const getCart = () => API.get("/cart");
// update qty
export const updateCartQty = (productId, qty) => API.post(`/cart/${productId}/${qty}`);
// clear cart
export const clearCart = () => API.delete("/cart");

export default API;
