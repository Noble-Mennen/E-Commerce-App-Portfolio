// orders.service.js — Business logic for order endpoints.
//
// Ownership rule: the logged-in user may only read or modify their own orders.
// The check always runs before any write so a non-owner never triggers a DB change.
// 404 when the order doesn't exist at all; 403 when it exists but belongs to someone else.

const ordersData = require('../data/orders.data');

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

// Return all orders for the current user.
// Filtering by user_id in the query means a user can never see another's orders.
async function getAllOrders(userId) {
  return ordersData.getAllOrdersByUserId(userId);
}

// Return one order with its items.
// Throws 404 if the order doesn't exist, 403 if it belongs to a different user.
async function getOrderById(orderId, userId) {
  const order = await ordersData.getOrderById(orderId);

  if (!order) {
    const err = new Error(`Order with id ${orderId} not found`);
    err.status = 404;
    throw err;
  }

  if (order.user_id !== userId) {
    const err = new Error('You do not have permission to view this order');
    err.status = 403;
    throw err;
  }

  const items = await ordersData.getOrderItems(orderId);
  return { ...order, items };
}

// Update the status of an order the current user owns.
// Throws 400 if status is missing, 404/403 for the usual ownership reasons.
async function updateOrderStatus(orderId, userId, status) {
  if (!status || typeof status !== 'string' || !status.trim()) {
    const err = new Error('status is required');
    err.status = 400;
    throw err;
  }

  if (!VALID_STATUSES.includes(status.trim())) {
    const err = new Error(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  // Ownership check before writing — non-owners never cause a DB change.
  const order = await ordersData.getOrderById(orderId);

  if (!order) {
    const err = new Error(`Order with id ${orderId} not found`);
    err.status = 404;
    throw err;
  }

  if (order.user_id !== userId) {
    const err = new Error('You do not have permission to update this order');
    err.status = 403;
    throw err;
  }

  const updated = await ordersData.updateOrderStatus(orderId, status.trim());
  return updated;
}

// Delete an order the current user owns.
// ON DELETE CASCADE removes the order_items automatically.
// Throws 404/403 for the usual ownership reasons.
async function deleteOrder(orderId, userId) {
  const order = await ordersData.getOrderById(orderId);

  if (!order) {
    const err = new Error(`Order with id ${orderId} not found`);
    err.status = 404;
    throw err;
  }

  if (order.user_id !== userId) {
    const err = new Error('You do not have permission to delete this order');
    err.status = 403;
    throw err;
  }

  await ordersData.deleteOrder(orderId);
}

module.exports = { getAllOrders, getOrderById, updateOrderStatus, deleteOrder };