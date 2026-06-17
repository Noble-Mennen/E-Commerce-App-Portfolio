// cart.service.js — Business logic for cart endpoints.
//
// No ownership check is needed here — there is no :userId in the cart URL.
// The user's identity always comes from req.user.id (the session), so the
// cart returned is always the calling user's cart by definition.
// isAuthenticated in the route file is the only guard required.

const cartData = require('../data/cart.data');

// Fetch the current user's cart with all items and product details.
async function getCart(userId) {
  const cart  = await cartData.getCartByUserId(userId);
  const items = await cartData.getCartItems(cart.id);
  return { id: cart.id, items };
}

// Add a product to the cart, or increment its quantity if already present.
//
// Why catch 23503 instead of pre-checking the product?
// The FK constraint on cart_items.product_id fires instantly if the product
// doesn't exist, giving us the same guarantee as an explicit SELECT but with
// one fewer query. We translate it into a clean 404 here.
async function addItem(userId, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    const err = new Error('Quantity must be a positive integer');
    err.status = 400;
    throw err;
  }

  const cart = await cartData.getCartByUserId(userId);

  let item;
  try {
    item = await cartData.upsertItem(cart.id, productId, quantity);
  } catch (dbErr) {
    // Postgres foreign key violation — the product ID does not exist.
    if (dbErr.code === '23503') {
      const err = new Error(`Product with id ${productId} not found`);
      err.status = 404;
      throw err;
    }
    throw dbErr;
  }

  return item;
}

// Set the quantity of an existing cart item.
// The item must already be in the cart — this endpoint does not add new items.
async function updateItemQuantity(userId, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    const err = new Error('Quantity must be a positive integer');
    err.status = 400;
    throw err;
  }

  const cart = await cartData.getCartByUserId(userId);
  const item = await cartData.updateItemQuantity(cart.id, productId, quantity);

  if (!item) {
    const err = new Error(`Product with id ${productId} is not in your cart`);
    err.status = 404;
    throw err;
  }

  return item;
}

// Remove one item from the cart.
async function removeItem(userId, productId) {
  const cart    = await cartData.getCartByUserId(userId);
  const deleted = await cartData.removeItem(cart.id, productId);

  if (!deleted) {
    const err = new Error(`Product with id ${productId} is not in your cart`);
    err.status = 404;
    throw err;
  }
}

// Empty the entire cart.
// Clearing an already-empty cart is not an error.
async function clearCart(userId) {
  const cart = await cartData.getCartByUserId(userId);
  await cartData.clearCart(cart.id);
}

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };