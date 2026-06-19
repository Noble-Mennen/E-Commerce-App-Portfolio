import apiFetch from './client.js';

export function getOrders() {
  return apiFetch('/orders');
}

export function getOrder(id) {
  return apiFetch(`/orders/${id}`);
}

export function checkout() {
  return apiFetch('/checkout', { method: 'POST' });
}