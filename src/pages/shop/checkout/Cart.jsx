import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses, setDefaultAddress, createOrder } from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";

import { getImageUrl } from "../../../utils/imageUtils";
import { CartSkeleton } from "../../../components/common/Skeleton";

const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    cart,
    refreshCart,
    addToCart: globalAddToCart,
    updateQty: globalUpdateQty,
    removeFromCart,
    clearCart,
    loading,
  } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  /* ================= CART ================= */

  /* ================= ADDRESSES ================= */
  const loadAddresses = useCallback(async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch {
      showToast("Failed to load addresses", "error");
    }
  }, [showToast]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Use a ref to ensure we only fetch addresses once when items exist
  const fetchedAddresses = React.useRef(false);
  const hasItems = cart?.items?.length > 0;

  useEffect(() => {
    if (hasItems && !fetchedAddresses.current) {
      fetchedAddresses.current = true;
      loadAddresses();
    }
  }, [hasItems, loadAddresses]);

  const defaultAddress = addresses.find((a) => a.is_default || a.isdefault);

  /* ================= CART HANDLERS ================= */

  const handleUpdateItem = async (productId, updates) => {
    try {
      await globalAddToCart(productId, updates);
    } catch (err) {
      console.error("Update item error:", err);
      showToast(err.response?.data?.message || "Failed to update item", "error");
    }
  };

  const handleUpdateQty = async (product, newQty, currentItem) => {
    if (newQty < 1) return;
    const productId = product.id || product._id;
    try {
      await globalUpdateQty(productId, newQty, {
        size: currentItem?.size,
        color: currentItem?.color,
      });
    } catch (err) {
      console.error("Update qty error:", err);
      showToast(err.response?.data?.message || "Failed to update quantity", "error");
    }
  };

  const handleRemoveItem = async (productId, item) => {
    try {
      await removeFromCart(productId, item);
      showToast("Item removed from cart", "success");
    } catch (err) {
      console.error("Remove item error:", err);
      showToast("Failed to remove item", "error");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await clearCart();
      // Addresses clear is local UI state, might want to keep or maybe not needed if cart is null
      setAddresses([]);
      showToast("Cart cleared", "success");
    } catch {
      showToast("Failed to clear cart", "error");
    }
  };

  /* ================= CHECKOUT ================= */

  const activeItems = cart?.items?.filter((item) => item.product && item.quantity > 0) || [];

  const handleProceedCheckout = async () => {
    if (checkoutLoading) return;

    if (!activeItems.length) {
      showToast("Your cart is empty", "warning");
      return;
    }

    if (!addresses.length) {
      showToast("Please add a delivery address", "warning");
      navigate("/profile");
      return;
    }

    const hasDefault = addresses.some((a) => a.is_default || a.isdefault);

    if (!hasDefault) {
      showToast("Please select a default delivery address", "warning");
      setShowAddressPicker(true);
      return;
    }

    try {
      setCheckoutLoading(true);

      const res = await createOrder();

      const order = res.data?.data || res.data;
      const orderId = order.id || order._id;

      if (!orderId) {
        throw new Error("Order ID missing from response");
      }

      navigate(`/checkout/${orderId}`);
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create order";
      showToast(msg, "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ================= UI ================= */

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-12 w-full">
          <div className="h-10 bg-slate-200 rounded-2xl w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <CartSkeleton />
            <div className="h-80 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );

  const subtotal = activeItems.reduce((acc, item) => {
    const price = item.product.salePrice > 0 ? item.product.salePrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Bag</h1>
          {activeItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest px-4 py-2 hover:bg-red-50 rounded-xl"
            >
              Clear All
            </button>
          )}
        </div>

        {/* EMPTY CART */}
        {activeItems.length === 0 ? (
          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-20 text-center border border-slate-100 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
              🛒
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Your bag is empty</h2>
            <p className="mb-10 text-slate-500 font-medium text-lg leading-relaxed">
              Looks like you haven't added anything to your bag yet. Start exploring our premium
              collection!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              Explore Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
            {/* CART ITEMS */}
            <div className="space-y-4">
              {/* DELIVERY ADDRESS PREVIEW */}
              {defaultAddress && (
                <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl">
                      📍
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-1">
                        Deliver to
                      </p>
                      <p className="text-xl font-bold">
                        {defaultAddress.full_name || defaultAddress.fullname}
                      </p>
                      <p className="text-sm text-blue-100/80 font-medium">
                        {defaultAddress.address_line_1 || defaultAddress.addressline1},{" "}
                        {defaultAddress.city}, {defaultAddress.state} -{" "}
                        {defaultAddress.postal_code || defaultAddress.postalcode}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddressPicker(true)}
                    className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white hover:text-blue-600 transition-all active:scale-95"
                  >
                    Change Address
                  </button>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {activeItems.map((item) => (
                    <div
                      key={item.id || item.product?._id || item.product?.id}
                      className="flex flex-col sm:flex-row gap-6 p-8 group hover:bg-slate-50/50 transition-colors"
                    >
                      <div
                        onClick={() =>
                          navigate(`/product/${item.product?.id || item.product?._id}`)
                        }
                        className="w-28 h-28 bg-slate-50 rounded-3xl overflow-hidden p-3 border border-slate-100 flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform duration-500"
                      >
                        <img
                          src={getImageUrl(
                            item.product?.images?.[0] || item.product?.image || item.product,
                          )}
                          alt={item.product?.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              onClick={() =>
                                navigate(`/product/${item.product?.id || item.product?._id}`)
                              }
                              className="text-xl font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {item.product?.name}
                            </h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {item.product?.brand || "Premium"}
                            </p>

                            {/* Variants Selection */}
                            <div className="flex flex-wrap gap-3 mt-4">
                              {/* Quantity Control */}
                              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    handleUpdateQty(item.product, item.quantity - 1, item)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg disabled:opacity-30 transition-all font-bold text-xs"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-bold text-slate-800 text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpdateQty(item.product, item.quantity + 1, item)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-all font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>

                              {item.product?.sizes?.length > 0 && (
                                <select
                                  value={item.size || ""}
                                  onChange={(e) =>
                                    handleUpdateItem(item.product.id || item.product._id, {
                                      size: e.target.value,
                                      color: item.color,
                                      quantity: item.quantity,
                                    })
                                  }
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                                >
                                  <option value="" disabled>
                                    Size
                                  </option>
                                  {item.product.sizes.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {item.product?.colors?.length > 0 && (
                                <select
                                  value={item.color || ""}
                                  onChange={(e) =>
                                    handleUpdateItem(item.product.id || item.product._id, {
                                      color: e.target.value,
                                      size: item.size,
                                      quantity: item.quantity,
                                    })
                                  }
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                                >
                                  <option value="" disabled>
                                    Color
                                  </option>
                                  {item.product.colors.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleRemoveItem(item.product?.id || item.product?._id, item)
                            }
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="Remove item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex flex-col items-end pt-4 border-t border-slate-50 mt-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Item Total
                          </p>
                          <div className="flex items-center gap-3">
                            {item.product.salePrice > 0 && (
                              <p className="text-sm font-bold text-slate-400 line-through">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </p>
                            )}
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                              ₹
                              {(
                                (item.product.salePrice > 0
                                  ? item.product.salePrice
                                  : item.product.price) * item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100 sticky top-28">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold tracking-tight">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs tracking-widest">
                    Free
                  </span>
                </div>

                <div className="h-px bg-slate-50 my-4" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Total Amount
                    </p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      ₹{subtotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button
                disabled={checkoutLoading}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 ${
                  checkoutLoading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
                onClick={handleProceedCheckout}
              >
                {checkoutLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                🔒 Secure SSL encrypted Checkout
              </p>
            </div>
          </div>
        )}

        {/* ADDRESS PICKER MODAL */}
        {showAddressPicker && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  Select Address
                </h3>
                <button
                  onClick={() => setShowAddressPicker(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 transition-colors text-slate-400"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto px-1 scrollbar-hide">
                {addresses.map((addr) => {
                  const id = addr.id || addr._id;

                  return (
                    <div
                      key={id}
                      className={`group border-2 rounded-3xl p-6 cursor-pointer transition-all ${
                        addr.is_default || addr.isdefault
                          ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50"
                          : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                      }`}
                      onClick={async () => {
                        if (!(addr.is_default || addr.isdefault)) {
                          await setDefaultAddress(id);
                          showToast("Default address updated", "success");
                          await loadAddresses();
                        }
                        setShowAddressPicker(false);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-800 text-lg">
                          {addr.full_name || addr.fullname}
                        </p>
                        {(addr.is_default || addr.isdefault) && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 font-medium leading-relaxed">
                        {addr.addressline1}, {addr.city}, {addr.state} - {addr.postalcode}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-2"
                >
                  <span>+</span> Add New Address
                </button>

                <button
                  onClick={() => setShowAddressPicker(false)}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
