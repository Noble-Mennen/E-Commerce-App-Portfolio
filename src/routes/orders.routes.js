// orders.routes.js — Routes for order management.
//
// Mounted at /api/orders in app.js.
// All endpoints require authentication. Users can only view and manage their own orders.
//
// Endpoints:
//   GET    /api/orders      — list all orders for the current user
//   GET    /api/orders/:id  — get a single order with its items
//   PUT    /api/orders/:id  — update an order (e.g. cancel it)
//   DELETE /api/orders/:id  — delete an order

const { Router } = require('express');

const router = Router();

// GET    /api/orders
// GET    /api/orders/:id
// PUT    /api/orders/:id
// DELETE /api/orders/:id

module.exports = router;
