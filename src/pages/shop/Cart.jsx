import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { getCart, updateCartQty, clearCart } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Header from "../../components/common/Header";
import "../../styles/pages/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getCart();
      setCart(res.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleUpdateQty = async (productId, newQty) => {
    if (newQty === 0) {
      handleRemoveItem(productId);
      return;
    }
    if (newQty < 1) return;
    try {
      await updateCartQty(productId, newQty);
      fetchCartItems();
    } catch {
      showToast("Failed to update quantity", "error");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await updateCartQty(productId, 0);
      fetchCartItems();
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
      showToast("Cart cleared", "success");
    } catch {
      showToast("Failed to clear cart", "error");
    }
  };

  const calculateSubtotal = () => {
    return activeItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );

  const activeItems = cart?.items?.filter((item) => item.quantity > 0) || [];

  return (
    <div className="cart-page">
      <Header />
      <div className="container cart-container">
        <h1 className="page-title">Shopping Bag</h1>

        {activeItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your bag is currently empty.</p>
            <button
              className="shop-now-btn"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items List */}
            <div className="cart-items-list">
              <div className="cart-list-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              {activeItems.map((item) => (
                <div
                  key={item.product.id || item.product._id}
                  className="cart-item"
                >
                  <div className="item-info">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    />
                    <div className="item-details">
                      <h3
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      >
                        {item.product.name}
                      </h3>
                      <p className="item-price">₹{item.product.price}</p>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="item-qty">
                    <div className="qty-controls">
                      <button
                        onClick={() =>
                          handleUpdateQty(item.product.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQty(item.product.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}

              <div className="cart-actions-bottom">
                <button className="clear-cart-btn" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="summary-row total-row">
                  <span>Estimated Total</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
