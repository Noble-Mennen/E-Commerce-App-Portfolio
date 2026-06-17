// cart.controller.js — Request/response handling for cart endpoints.
//
// The user's identity always comes from req.user.id (the session).
// No URL param is ever used for user identity — the cart belongs to
// whoever is logged in.

const cartService = require('../services/cart.service');

// GET /api/cart
// Returns the current user's cart with all items and product details.
async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/items
// Adds a product to the cart, or increments its quantity if already present.
// Returns 201 Created with the cart_item row.
async function addItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addItem(req.user.id, productId, quantity);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

// PUT /api/cart/items/:productId
// Sets the quantity of an existing cart item.
// Returns the updated cart_item row.
async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const item = await cartService.updateItemQuantity(req.user.id, req.params.productId, quantity);
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/items/:productId
// Removes one item from the cart. Returns 204 No Content.
async function removeItem(req, res, next) {
  try {
    await cartService.removeItem(req.user.id, req.params.productId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart
// Empties the entire cart. Returns 204 No Content.
async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };