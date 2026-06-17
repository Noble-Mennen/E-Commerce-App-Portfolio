// orders.routes.js — Routes for order endpoints.
//
// Mounted at /api/orders in app.js. All routes require authentication.
// The Self/Owner check (user may only act on their own orders) is handled
// in the service layer, not here — the route only enforces "logged in".
//
// Endpoints:
//   GET    /api/orders      — list the current user's orders
//   GET    /api/orders/:id  — get one order with its items (owner only)
//   PUT    /api/orders/:id  — update order status (owner only)
//   DELETE /api/orders/:id  — delete an order (owner only)

const { Router } = require('express');
const isAuthenticated   = require('../middleware/isAuthenticated');
const ordersController  = require('../controllers/orders.controller');

const router = Router();

router.get('/',     isAuthenticated, ordersController.getAllOrders);
router.get('/:id',  isAuthenticated, ordersController.getOrderById);
router.put('/:id',  isAuthenticated, ordersController.updateOrder);
router.delete('/:id', isAuthenticated, ordersController.deleteOrder);

module.exports = router;
