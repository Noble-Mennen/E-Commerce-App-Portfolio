// orders.js: API functions for the orders resource.
// All functions use apiFetch, which attaches the session cookie and unwraps
// the { error: { message } } envelope from the backend on failure.

import apiFetch from './client.js';

// Fetch all orders for the current user. Returns { orders: [...] }.
export function getOrders() {
  return apiFetch('/orders');
}

// Fetch a single order with its line items. Returns { order }.
export function getOrder(id) {
  return apiFetch(`/orders/${id}`);
}

// Set an order's status to 'cancelled'. Returns { order } with the updated row.
// Only valid for orders the current user owns; the backend enforces ownership.
export function cancelOrder(id) {
  return apiFetch(`/orders/${id}`, { method: 'PUT', body: { status: 'cancelled' } });
}

// Submit the current user's cart as a new order. Returns { order }.
export function checkout() {
  return apiFetch('/checkout', { method: 'POST' });
}