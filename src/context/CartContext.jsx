import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQty as apiUpdateCartQty } from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

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
            console.error('Error fetching cart:', error);
            // Don't show toast on every mount if not logged in
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch if token exists
        if (localStorage.getItem('token')) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [fetchCart]);

    const addToCart = useCallback(async (productId, data) => {
        try {
            await apiAddToCart(productId, data);
            await fetchCart(); // Always refresh to get the full updated state
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    }, [fetchCart]);

    const updateQty = useCallback(async (productId, qty, data) => {
        try {
            await apiUpdateCartQty(productId, qty, data);
            await fetchCart(); // Always refresh to get the full updated state
        } catch (error) {
            console.error('Update qty error:', error);
            throw error;
        }
    }, [fetchCart]);

    const refreshCart = useCallback(() => fetchCart(), [fetchCart]);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            loading,
            addToCart,
            updateQty,
            refreshCart,
            setCart // Allow direct updates if needed
        }}>
            {children}
        </CartContext.Provider>
    );
};
