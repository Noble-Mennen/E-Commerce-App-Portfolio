// products.controller.js — Request/response handling for product endpoints.
//
// Controllers are the HTTP layer. Each function:
//   1. Reads what it needs from req (body, params)
//   2. Calls the matching service function
//   3. Sends the response, or forwards errors to the centralized error handler via next(err)
//
// No SQL or business logic lives here — that belongs in the layers below.

const productsService = require('../services/products.service');

// GET /api/products
// Returns all products as an array. Always 200 — an empty store is not an error.
async function getAllProducts(req, res, next) {
  try {
    const products = await productsService.getAllProducts();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
// Returns one product. The service throws 404 if the ID doesn't exist.
// req.params.id comes in as a string — the data layer passes it to pg as a
// parameterized value, which handles the string-to-integer coercion safely.
async function getProductById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// POST /api/products
// Creates a new product. Returns 201 Created with the new product row.
// Protected by isAuthenticated in the route file — only logged-in users can create products.
async function createProduct(req, res, next) {
  try {
    const { name, description, price, stock } = req.body;
    const product = await productsService.createProduct({ name, description, price, stock });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
// Updates an existing product. Only the fields included in req.body are changed.
// Returns the full updated product row. The service throws 404 if the ID doesn't exist.
async function updateProduct(req, res, next) {
  try {
    const { name, description, price, stock } = req.body;
    const product = await productsService.updateProduct(req.params.id, { name, description, price, stock });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
// Deletes a product. Returns 204 No Content on success — there's nothing to send back.
// The service throws 404 if the ID doesn't exist.
async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };