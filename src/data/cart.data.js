// cart.data.js — Data access layer for cart and cart_items tables.
//
// Rules of this layer:
//   - No business logic, no validation, no HTTP concepts
//   - Returns raw rows; undefined if no row matched
//   - The service layer above decides what to do with the results

const pool = require('../db/pool');

// Fetch the cart row for a given user.
// Every registered user has exactly one cart (created at registration),
// so this should always return a row for an authenticated user.
async function getCartByUserId(userId) {
  const result = await pool.query(
    'SELECT id, user_id, created_at FROM carts WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

// Fetch all items in a cart, joined with their product details.
// The JOIN avoids a second round-trip — the client needs product name,
// price, and stock to render the cart, so we pull them here in one query.
// Returns an array (may be empty if the cart has no items).
async function getCartItems(cartId) {
  const result = await pool.query(
    `SELECT
       ci.id,
       ci.product_id,
       ci.quantity,
       p.name  AS product_name,
       p.price,
       p.stock,
       p.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id ASC`,
    [cartId]
  );
  return result.rows;
}

// Insert a new cart item, or increment its quantity if it already exists.
//
// The UNIQUE (cart_id, product_id) constraint on cart_items makes ON CONFLICT
// the right tool here — it handles "add" and "increment" atomically in one
// query rather than a SELECT + INSERT-or-UPDATE sequence.
//
// Returns the inserted or updated cart_item row.
async function upsertItem(cartId, productId, quantity) {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cartId, productId, quantity]
  );
  return result.rows[0];
}

// Set the quantity of an existing cart item.
// Returns the updated row, or undefined if no matching item was found.
async function updateItemQuantity(cartId, productId, quantity) {
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = $1
     WHERE cart_id = $2 AND product_id = $3
     RETURNING *`,
    [quantity, cartId, productId]
  );
  return result.rows[0];
}

// Remove one item from the cart by product ID.
// Returns the deleted row, or undefined if no matching item was found.
async function removeItem(cartId, productId) {
  const result = await pool.query(
    `DELETE FROM cart_items
     WHERE cart_id = $1 AND product_id = $2
     RETURNING *`,
    [cartId, productId]
  );
  return result.rows[0];
}

// Remove all items from the cart.
// Clearing an already-empty cart is not an error, so no RETURNING needed.
async function clearCart(cartId) {
  await pool.query(
    'DELETE FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
}

module.exports = { getCartByUserId, getCartItems, upsertItem, updateItemQuantity, removeItem, clearCart };