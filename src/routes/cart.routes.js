// cart.routes.js — Routes for the shopping cart.
//
// Mounted at /api/cart in app.js.
// All endpoints require authentication. The cart belongs to the logged-in user,
// so the user ID comes from req.user (set by Passport) rather than from the URL.
//
// Endpoints:
//   GET    /api/cart                  — get the current user's cart with all items
//   POST   /api/cart/items            — add a product to the cart (or increment quantity)
//   PUT    /api/cart/items/:productId — update the quantity of a specific cart item
//   DELETE /api/cart/items/:productId — remove a specific item from the cart
//   DELETE /api/cart                  — empty the entire cart

const { Router } = require('express');

const router = Router();

// GET    /api/cart
// POST   /api/cart/items
// PUT    /api/cart/items/:productId
// DELETE /api/cart/items/:productId
// DELETE /api/cart

module.exports = router;
