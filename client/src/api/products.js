import apiFetch from './client.js';

export function getProducts() {
  return apiFetch('/products');
}

export function getProduct(id) {
  return apiFetch(`/products/${id}`);
}