// checkout.controller.js — Request/response handling for the checkout endpoint.
//
// The controller's only job is HTTP: read from req, call the service, send the
// response. All business logic and transaction management live in the service.

const checkoutService = require('../services/checkout.service');

// POST /api/checkout
// Converts the current user's cart into a paid order.
// Returns 201 Created with the full order and its items.
async function checkout(req, res, next) {
  try {
    const order = await checkoutService.checkout(req.user.id);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout };