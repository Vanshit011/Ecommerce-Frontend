import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartQty,
  clearCart,
  getAddresses,
  setDefaultAddress,
  createOrder,
} from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/common/Header";

const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  /* ================= CART ================= */

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    if (cart?.items?.some((item) => item.quantity > 0)) {
      loadAddresses();
    }
  }, [cart]);

  /* ================= ADDRESSES ================= */

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch {
      showToast("Failed to load addresses", "error");
    }
  };

  const defaultAddress = addresses.find((a) => a.isdefault);

  /* ================= CART HANDLERS ================= */

  const handleUpdateQty = async (productId, newQty) => {
    if (newQty < 1) return;

    try {
      await updateCartQty(productId, newQty);

      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.product.id === productId ? { ...item, quantity: newQty } : item,
        ),
      }));
    } catch {
      showToast("Failed to update quantity", "error");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await updateCartQty(productId, 0);

      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.product.id !== productId),
      }));

      showToast("Item removed from cart", "success");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await clearCart();
      setCart(null);
      setAddresses([]);
      showToast("Cart cleared", "success");
    } catch {
      showToast("Failed to clear cart", "error");
    }
  };

  /* ================= CHECKOUT ================= */

  const activeItems = cart?.items?.filter((item) => item.quantity > 0) || [];

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

    const hasDefault = addresses.some((a) => a.isdefault);

    if (!hasDefault) {
      showToast("Please select a default delivery address", "warning");
      setShowAddressPicker(true);
      return;
    }

    try {
      setCheckoutLoading(true);

      const res = await createOrder();

      const order = res.data?.data || res.data;

      navigate(`/checkout/${order.id}`);
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);
      showToast("Failed to create order", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ================= UI ================= */

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500">Loading your cart...</span>
        </div>
      </div>
    );

  const subtotal = activeItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Shopping Bag</h1>

        {/* DELIVERY ADDRESS */}
        {activeItems.length > 0 && defaultAddress && (
          <div className="bg-white rounded-lg shadow p-5 mb-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Deliver to</p>

              <p className="font-medium">{defaultAddress.fullname}</p>

              <p className="text-sm text-gray-600">
                {defaultAddress.addressline1}, {defaultAddress.city},{" "}
                {defaultAddress.state} - {defaultAddress.postalcode}
              </p>
            </div>

            <button
              onClick={() => setShowAddressPicker(true)}
              className="border px-4 py-1.5 rounded text-sm text-blue-600"
            >
              Change
            </button>
          </div>
        )}

        {/* EMPTY CART */}
        {activeItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="mb-5 text-gray-600">Your bag is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
            {/* CART ITEMS */}
            <div className="bg-white rounded-lg shadow divide-y">
              {activeItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex flex-col sm:flex-row gap-4 p-5"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    onClick={() => navigate(`/product/${item.product.id}`)}
                    className="w-24 h-24 object-contain cursor-pointer bg-gray-50 rounded"
                  />

                  <div className="flex-1">
                    <h3
                      onClick={() => navigate(`/product/${item.product.id}`)}
                      className="font-medium cursor-pointer hover:text-blue-600"
                    >
                      {item.product.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      ₹{item.product.price}
                    </p>
                  </div>

                  {/* QTY */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQty(item.product.id, item.quantity - 1)
                      }
                      className="border px-2 rounded disabled:opacity-40"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1) handleUpdateQty(item.product.id, val);
                      }}
                      className="w-14 border text-center rounded"
                    />

                    <button
                      onClick={() =>
                        handleUpdateQty(item.product.id, item.quantity + 1)
                      }
                      className="border px-2 rounded"
                    >
                      +
                    </button>
                  </div>

                  {/* TOTAL */}
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {/* ACTIONS */}
              <div className="flex justify-between p-5">
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600"
                >
                  Clear Cart
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="text-sm text-blue-600"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-lg shadow p-5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>

              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Estimated Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <button
                disabled={checkoutLoading}
                className="mt-5 w-full bg-yellow-400 py-3 rounded font-semibold disabled:opacity-60"
                onClick={handleProceedCheckout}
              >
                {checkoutLoading ? "Creating Order..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        )}

        {/* ADDRESS PICKER MODAL */}
        {showAddressPicker && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white max-w-lg w-full rounded-lg p-5">
              <h3 className="font-semibold mb-4">Select Delivery Address</h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {addresses.map((addr) => {
                  const id = addr.id;

                  return (
                    <div
                      key={id}
                      className={`border rounded p-3 cursor-pointer ${
                        addr.isdefault && "border-blue-600"
                      }`}
                      onClick={async () => {
                        if (!addr.isdefault) {
                          await setDefaultAddress(id);
                          showToast("Default address updated", "success");
                          await loadAddresses();
                        }
                        setShowAddressPicker(false);
                      }}
                    >
                      {addr.isdefault && (
                        <span className="text-xs text-blue-600">DEFAULT</span>
                      )}

                      <p className="font-medium">{addr.fullname}</p>

                      <p className="text-sm">
                        {addr.addressline1}, {addr.city}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-5">
                <button
                  onClick={() => navigate("/profile")}
                  className="text-blue-600 text-sm"
                >
                  + Add New Address
                </button>

                <button
                  onClick={() => setShowAddressPicker(false)}
                  className="border px-4 py-1 rounded"
                >
                  Close
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
