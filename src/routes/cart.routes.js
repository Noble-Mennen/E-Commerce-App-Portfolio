// cart.routes.js — Routes for cart endpoints.
//
// Mounted at /api/cart in app.js. All routes are Auth level — the user
// must be logged in, but there is no ownership check beyond that because
// the cart is always the session user's cart (no :userId in any URL).
//
// Endpoints:
//   GET    /api/cart                   — view cart with items
//   POST   /api/cart/items             — add item (or increment quantity)
//   PUT    /api/cart/items/:productId  — set item quantity
//   DELETE /api/cart/items/:productId  — remove one item
//   DELETE /api/cart                   — empty the cart

const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const cartController  = require('../controllers/cart.controller');

const router = Router();

router.get('/',                     isAuthenticated, cartController.getCart);
router.post('/items',               isAuthenticated, cartController.addItem);
router.put('/items/:productId',     isAuthenticated, cartController.updateItem);
router.delete('/items/:productId',  isAuthenticated, cartController.removeItem);
router.delete('/',                  isAuthenticated, cartController.clearCart);

module.exports = router;
