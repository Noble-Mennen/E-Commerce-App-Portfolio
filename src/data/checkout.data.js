// checkout.data.js — Data access layer for the checkout transaction.
//
// Every function in this file receives a pg client rather than using the
// shared pool. This is intentional: all checkout queries must run on the
// same connection so they participate in the transaction that the service
// layer manages with BEGIN / COMMIT / ROLLBACK.
//
// Rules of this layer:
//   - No business logic, no validation, no HTTP concepts
//   - Returns raw rows; the service layer interprets the results
//   - Never call pool.query here — always use the passed-in client

// Fetch the cart row for a given user within the active transaction.
async function getCartByUserId(userId, client) {
  const result = await client.query(
    'SELECT id, user_id FROM carts WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

// Fetch all items in a cart, joined with their product details.
//
// The JOIN pulls product_name, price, and stock in one query so the service
// layer can validate stock and snapshot prices without additional round-trips.
async function getCartItems(cartId, client) {
  const result = await client.query(
    `SELECT
       ci.id,
       ci.product_id,
       ci.quantity,
       p.name  AS product_name,
       p.price,
       p.stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id ASC`,
    [cartId]
  );
  return result.rows;
}

// Insert a new row into the orders table with status 'pending'.
// The service updates this to 'paid' once all order_items are inserted.
async function createOrder(userId, total, client) {
  const result = await client.query(
    `INSERT INTO orders (user_id, total, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [userId, total]
  );
  return result.rows[0];
}

// Insert one row into order_items, snapshotting product_name and unit_price.
//
// Snapshotting at insert time means historical orders reflect what the
// customer actually paid, even if the product's price changes later.
async function insertOrderItem(orderId, { product_id, product_name, unit_price, quantity }, client) {
  const result = await client.query(
    `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orderId, product_id, product_name, unit_price, quantity]
  );
  return result.rows[0];
}

// Advance the order status from 'pending' to the given status.
async function updateOrderStatus(orderId, status, client) {
  const result = await client.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

// Decrement a product's stock by the purchased quantity within the active transaction.
//
// Running inside the transaction means a ROLLBACK (on any later failure) undoes
// both the order_items insert and this stock change atomically — no orphaned stock
// decrements for orders that never committed.
async function decrementStock(productId, quantity, client) {
  const result = await client.query(
    'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING id, stock',
    [quantity, productId]
  );
  return result.rows[0];
}

// Remove all items from the cart after a successful checkout.
async function clearCartItems(cartId, client) {
  await client.query(
    'DELETE FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
}

module.exports = {
  getCartByUserId,
  getCartItems,
  createOrder,
  insertOrderItem,
  decrementStock,
  updateOrderStatus,
  clearCartItems,
};