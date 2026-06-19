import { createContext, useContext, useEffect, useState } from 'react';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../api/cart.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch or clear the cart whenever the logged-in user changes.
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  async function fetchCart() {
    setCartLoading(true);
    try {
      const data = await getCart();
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }

  async function addItem(productId, quantity) {
    await addToCart(productId, quantity);
    await fetchCart();
  }

  async function updateItem(productId, quantity) {
    await updateCartItem(productId, quantity);
    await fetchCart();
  }

  async function removeItem(productId) {
    await removeCartItem(productId);
    await fetchCart();
  }

  async function clearCartItems() {
    await clearCart();
    await fetchCart();
  }

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, itemCount, addItem, updateItem, removeItem, clearCartItems, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}