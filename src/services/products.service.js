// products.service.js — Business logic for products.
//
// This layer sits between the controller (HTTP) and the data layer (SQL).
// It owns two responsibilities:
//   1. Validation — reject bad input before it reaches the database.
//   2. Interpretation — turn raw database results into meaningful errors
//      (e.g. a missing row becomes a 404, not undefined).
//
// This file knows nothing about req, res, or HTTP status codes beyond setting
// err.status so the centralized error handler can respond correctly.

const productsData = require('../data/products.data');

// Return all products.
// No validation needed — fetching a list always succeeds (it may just be empty).
async function getAllProducts() {
  return productsData.getAllProducts();
}

// Return a single product by ID, or throw 404 if it doesn't exist.
async function getProductById(id) {
  const product = await productsData.getProductById(id);

  if (!product) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  return product;
}

// Validate and create a new product.
//
// Required fields: name, price
// Optional fields: description (defaults to null), stock (defaults to 0)
//
// Price and stock must be non-negative numbers to match the CHECK constraints
// in the database schema. Catching these here produces a clear 400 error
// rather than a raw PostgreSQL constraint violation.
async function createProduct({ name, description, price, stock }) {
  // --- Validation ---
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Product name is required');
    err.status = 400;
    throw err;
  }

  // Accept price as a string (JSON numbers come in as numbers, but be safe).
  const parsedPrice = Number(price);
  if (price === undefined || price === null || isNaN(parsedPrice)) {
    const err = new Error('Product price is required and must be a number');
    err.status = 400;
    throw err;
  }
  if (parsedPrice < 0) {
    const err = new Error('Product price cannot be negative');
    err.status = 400;
    throw err;
  }

  // Stock is optional — default to 0 if not provided.
  const parsedStock = stock !== undefined ? Number(stock) : 0;
  if (isNaN(parsedStock) || parsedStock < 0) {
    const err = new Error('Product stock must be a non-negative number');
    err.status = 400;
    throw err;
  }

  return productsData.createProduct({
    name:        name.trim(),
    description: description?.trim() ?? null,
    price:       parsedPrice,
    stock:       parsedStock,
  });
}

// Validate and update an existing product.
//
// Only the fields present in the request body are updated — undefined fields
// are excluded so we never accidentally wipe out existing data.
// Throws 400 for invalid values, 404 if the product doesn't exist.
async function updateProduct(id, { name, description, price, stock }) {
  // Build an object containing only the fields the caller actually sent.
  const fields = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      const err = new Error('Product name cannot be empty');
      err.status = 400;
      throw err;
    }
    fields.name = name.trim();
  }

  if (description !== undefined) {
    // Allow setting description to an empty string (clears it).
    fields.description = description?.trim() ?? null;
  }

  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      const err = new Error('Product price must be a non-negative number');
      err.status = 400;
      throw err;
    }
    fields.price = parsedPrice;
  }

  if (stock !== undefined) {
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      const err = new Error('Product stock must be a non-negative number');
      err.status = 400;
      throw err;
    }
    fields.stock = parsedStock;
  }

  if (Object.keys(fields).length === 0) {
    const err = new Error('No valid fields provided for update');
    err.status = 400;
    throw err;
  }

  const product = await productsData.updateProduct(id, fields);

  // updateProduct returns undefined when no row matched the given ID.
  if (!product) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  return product;
}

// Delete a product by ID.
// Throws 404 if no product with that ID exists.
async function deleteProduct(id) {
  const product = await productsData.deleteProduct(id);

  if (!product) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  return product;
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };