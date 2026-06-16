// checkout.routes.js — Route for checkout.
//
// Mounted at /api/checkout in app.js.
// Requires authentication. Converts the current user's cart into a completed order
// inside a single database transaction so the operation is atomic (all or nothing).
//
// Checkout flow (implemented in task 12):
//   1. Load the user's cart and items — reject if empty
//   2. Compute the total
//   3. Create an order row with status 'pending'
//   4. Copy each cart item into order_items, snapshotting product name and price
//   5. Set order status to 'paid' (payment is assumed to succeed)
//   6. Clear the cart
//   7. Return the created order
//
// Endpoint:
//   POST /api/checkout

const { Router } = require('express');

const router = Router();

// POST /api/checkout

module.exports = router;
