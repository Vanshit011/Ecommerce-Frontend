import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQty as apiUpdateCartQty,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from "../services/api";
import { CartItem, Coupon, CartData } from "../types";

interface CartContextType {
  cart: CartData | null;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, data: { variantId?: string; quantity: number }) => Promise<void>;
  updateQty: (productId: string, qty: number, variantId?: string) => Promise<void>;
  removeFromCart: (productId: string, item: any) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: (showLoading?: boolean) => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartData | null>>;
}

const CartContext = createContext<CartContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      const res = await getCart();
      const cartData = res.data.data; // Note: getCart returns ApiResponse<{ items: CartItem[]; ... }>
      setCart(cartData);

      // Calculate total quantity
      const count = (cartData?.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      if (showLoading) setLoading(false);
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
    async (productId: string, data: { variantId?: string; quantity: number }) => {
      try {
        await apiAddToCart(productId, data);
        await fetchCart(false); // Background refresh for smooth UI
      } catch (error) {
        console.error("Add to cart error:", error);
        throw error;
      }
    },
    [fetchCart],
  );

  const updateQty = useCallback(
    async (productId: string, qty: number, variantId?: string) => {
      try {
        await apiUpdateCartQty(productId, qty, variantId);
        await fetchCart(false); // Background refresh
      } catch (error) {
        console.error("Update qty error:", error);
        throw error;
      }
    },
    [fetchCart],
  );

  const removeFromCart = useCallback(
    async (productId: string, item: any) => {
      // Optimistic Update
      const previousCart = cart;
      const variantId = item.variant_id || item.variant?._id || item.variant?.id;

      setCart((prev) => {
        if (!prev || !prev.items) return prev;
        const updatedItems = prev.items.filter((i) => {
          const pId = (i.product as any)?._id || (i.product as any)?.id;
          const vId = (i as any).variant_id || i.variant?._id || (i.variant as any)?.id;
          return !(pId === productId && vId === variantId);
        });
        return { ...prev, items: updatedItems };
      });

      // Update count immediately
      setCartCount((prev) => Math.max(0, prev - (item.quantity || 1)));

      try {
        await apiRemoveCartItem(productId, variantId);
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

  const refreshCart = useCallback((showLoading = false) => fetchCart(showLoading), [fetchCart]);

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
