// orders.controller.js — Request/response handling for order endpoints.
//
// Controllers are the HTTP layer only. Each function reads from req,
// calls the matching service function, and sends the response or forwards
// errors to the centralized error handler via next(err).

const ordersService = require('../services/orders.service');

// GET /api/orders
// Returns all orders belonging to the current user.
async function getAllOrders(req, res, next) {
  try {
    const orders = await ordersService.getAllOrders(req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
// Returns one order with its items. Service throws 404 or 403 if needed.
async function getOrderById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id, req.user.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id
// Updates the order's status. Returns the updated order.
async function updateOrder(req, res, next) {
  try {
    const order = await ordersService.updateOrderStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/orders/:id
// Deletes the order and its items. Returns 204 No Content.
async function deleteOrder(req, res, next) {
  try {
    await ordersService.deleteOrder(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllOrders, getOrderById, updateOrder, deleteOrder };