import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQty as apiUpdateCartQty,
  clearCart as apiClearCart,
} from "../services/api";

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCart();
      const cartData = res.data;
      setCart(cartData);

      // Calculate total quantity
      const count = (cartData?.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Don't show toast on every mount if not logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if token exists AND user is NOT an admin
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role !== "admin") {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId, data) => {
      try {
        await apiAddToCart(productId, data);
        await fetchCart(); // Always refresh to get the full updated state
      } catch (error) {
        console.error("Add to cart error:", error);
        throw error;
      }
    },
    [fetchCart],
  );

  const updateQty = useCallback(
    async (productId, qty, data) => {
      try {
        await apiUpdateCartQty(productId, qty, data);
        await fetchCart(); // Always refresh to get the full updated state
      } catch (error) {
        console.error("Update qty error:", error);
        throw error;
      }
    },
    [fetchCart],
  );

  const removeFromCart = useCallback(
    async (productId, item) => {
      // Optimistic Update
      const previousCart = cart;

      setCart((prev) => {
        if (!prev || !prev.items) return prev;
        const updatedItems = prev.items.filter((i) => {
          const pId = i.product._id || i.product.id;
          return pId !== productId;
        });
        return { ...prev, items: updatedItems };
      });

      // Update count immediately
      setCartCount((prev) => Math.max(0, prev - (item.quantity || 1)));

      try {
        // We use updateQty with 0 to remove on backend as per previous pattern,
        // or we could use a specific remove endpoint if it existed.
        // The user's code used globalUpdateQty(productId, 0, ...).
        // Let's assume we should call the API similarly.
        await apiUpdateCartQty(productId, 0, {
          size: item?.size,
          color: item?.color,
        });
        await fetchCart();
      } catch (error) {
        console.error("Remove from cart error:", error);
        // Revert on failure
        setCart(previousCart);
        // Recalculate count from previous cart
        const count = (previousCart?.items || []).reduce((sum, i) => sum + i.quantity, 0);
        setCartCount(count);
        throw error;
      }
    },
    [cart, fetchCart],
  );

  const clearCart = useCallback(async () => {
    try {
      await apiClearCart();
      setCart(null);
      setCartCount(0);
    } catch (error) {
      console.error("Clear cart error:", error);
      throw error;
    }
  }, []);

  const refreshCart = useCallback(() => fetchCart(), [fetchCart]);

  const value = React.useMemo(
    () => ({
      cart,
      cartCount,
      loading,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      refreshCart,
      setCart, // Allow direct updates if needed
    }),
    [cart, cartCount, loading, addToCart, updateQty, removeFromCart, clearCart, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
