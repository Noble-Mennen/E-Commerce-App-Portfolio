// products.js: API functions for the products resource.
//
// All functions delegate to apiFetch, which attaches the session cookie,
// sets Content-Type on requests with a body, and unwraps the backend's
// { error: { message } } envelope into a thrown Error on failure.

import apiFetch from './client.js';

// Fetch all products. Returns { products: [...] }.
export function getProducts() {
  return apiFetch('/products');
}

// Fetch a single product by its numeric ID. Returns { product }.
export function getProduct(id) {
  return apiFetch(`/products/${id}`);
}

// Create a new product (admin only). Returns { product } with the saved row.
// data: { name, description?, price, stock, image_url? }
export function createProduct(data) {
  return apiFetch('/products', { method: 'POST', body: data });
}

// Update an existing product by ID (admin only). Returns { product }.
// data can be any subset of product fields; the backend applies a partial update.
export function updateProduct(id, data) {
  return apiFetch(`/products/${id}`, { method: 'PUT', body: data });
}

// Delete a product by ID (admin only). Returns null (204 No Content).
export function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}