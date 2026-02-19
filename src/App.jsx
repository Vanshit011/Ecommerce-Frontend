import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminRegister from "./pages/auth/AdminRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/shop/Home";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import ShopLayout from "./components/layout/ShopLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
// Product browsing
import Favorites from "./pages/shop/products/Favorites";
import Products from "./pages/shop/products/Products";
import ProductDetails from "./pages/shop/products/ProductDetails";

// Checkout flow
import Cart from "./pages/shop/checkout/Cart";
import OrderSuccess from "./pages/shop/checkout/OrderSuccess";

const Checkout = lazy(() => import("./pages/shop/checkout/Checkout"));

// User account
import Profile from "./pages/shop/account/Profile";
import MyOrders from "./pages/shop/account/MyOrders";
import MyPayments from "./pages/shop/account/MyPayments";

import ToastProvider from "./context/ToastContext.jsx";
import CartProvider from "./context/CartContext.jsx";

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes with Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            {/* Shop Routes with Layout */}
            <Route element={<ShopLayout />}>
              {/* Public Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/:id"
                element={
                  <ProtectedRoute>
                    <Suspense
                      fallback={
                        <div className="min-h-screen flex items-center justify-center bg-slate-50">
                          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                      }
                    >
                      <Checkout />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success/:id"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-payments"
                element={
                  <ProtectedRoute>
                    <MyPayments />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
