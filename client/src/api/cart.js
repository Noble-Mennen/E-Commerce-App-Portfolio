import apiFetch from './client.js';

export function getCart() {
  return apiFetch('/cart');
}

export function addToCart(productId, quantity) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: { productId, quantity },
  });
}

export function updateCartItem(productId, quantity) {
  return apiFetch(`/cart/items/${productId}`, {
    method: 'PUT',
    body: { quantity },
  });
}

export function removeCartItem(productId) {
  return apiFetch(`/cart/items/${productId}`, { method: 'DELETE' });
}

export function clearCart() {
  return apiFetch('/cart', { method: 'DELETE' });
}