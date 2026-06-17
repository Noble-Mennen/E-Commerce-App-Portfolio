// orders.data.js — Data access layer for the orders and order_items tables.
//
// Rules of this layer:
//   - No business logic, no validation, no HTTP concepts
//   - Returns raw rows; undefined if no row matched
//   - The service layer above decides what to do with the results

const pool = require('../db/pool');

// Fetch all orders for a given user, newest first.
// Returns an array (may be empty if the user has no orders yet).
async function getAllOrdersByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, status, total, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Fetch a single order by its primary key.
// Returns the full row including user_id so the service can check ownership.
// Returns undefined if no order with that id exists.
async function getOrderById(id) {
  const result = await pool.query(
    `SELECT id, user_id, status, total, created_at
     FROM orders
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

// Fetch all items belonging to an order.
// Returns an array (an order always has at least one item, but we don't enforce that here).
async function getOrderItems(orderId) {
  const result = await pool.query(
    `SELECT id, order_id, product_id, product_name, unit_price, quantity
     FROM order_items
     WHERE order_id = $1
     ORDER BY id ASC`,
    [orderId]
  );
  return result.rows;
}

// Update the status of an order.
// Returns the updated row, or undefined if no order with that id exists.
async function updateOrderStatus(id, status) {
  const result = await pool.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING id, user_id, status, total, created_at`,
    [status, id]
  );
  return result.rows[0];
}

// Delete an order by primary key.
// ON DELETE CASCADE on order_items handles removing the items automatically.
// Returns the deleted row, or undefined if no order with that id exists.
async function deleteOrder(id) {
  const result = await pool.query(
    `DELETE FROM orders WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllOrdersByUserId,
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  deleteOrder,
};