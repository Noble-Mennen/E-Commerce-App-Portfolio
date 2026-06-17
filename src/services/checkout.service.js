// checkout.service.js — Business logic for the checkout flow.
//
// This is the only service in the app that manages a DB transaction directly.
// It acquires a client from the pool, issues BEGIN, orchestrates all seven
// checkout steps by passing the client down to the data layer, then commits.
// Any failure at any step triggers ROLLBACK so the database is never left
// in a partially-completed state.

const pool = require('../db/pool');
const checkoutData = require('../data/checkout.data');

async function checkout(userId) {
  // Acquire a dedicated connection so all queries share the same transaction.
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Load the user's cart and its items.
    const cart = await checkoutData.getCartByUserId(userId, client);
    const items = await checkoutData.getCartItems(cart.id, client);

    if (items.length === 0) {
      const err = new Error('Cannot checkout with an empty cart');
      err.status = 400;
      throw err;
    }

    // Step 2: Validate stock for every item before touching the orders table.
    // Checking inside the transaction means the stock values we read are part
    // of the same snapshot, protecting against concurrent depletions.
    for (const item of items) {
      if (item.quantity > item.stock) {
        const err = new Error(
          `Insufficient stock for "${item.product_name}": ` +
          `requested ${item.quantity}, available ${item.stock}`
        );
        err.status = 400;
        throw err;
      }
    }

    // Step 3: Compute the total and create the order row.
    // price comes back from Postgres as a string (NUMERIC avoids JS float issues),
    // so we parse it before multiplying. We round to 2 decimal places to match
    // the NUMERIC(10,2) column and avoid accumulated floating-point drift.
    const rawTotal = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const total = Math.round(rawTotal * 100) / 100;

    const order = await checkoutData.createOrder(userId, total, client);

    // Step 4: Copy each cart item into order_items, snapshotting name and price.
    const orderItems = [];
    for (const item of items) {
      const orderItem = await checkoutData.insertOrderItem(order.id, {
        product_id:   item.product_id,
        product_name: item.product_name,
        unit_price:   item.price,
        quantity:     item.quantity,
      }, client);
      orderItems.push(orderItem);
    }

    // Step 5: Assume the charge succeeds — advance status to 'paid'.
    const paidOrder = await checkoutData.updateOrderStatus(order.id, 'paid', client);

    // Step 6: Clear the cart so it is ready for the next session.
    await checkoutData.clearCartItems(cart.id, client);

    await client.query('COMMIT');

    // Step 7: Return the completed order with its items.
    // We build this from in-memory data rather than issuing another SELECT —
    // every piece was returned by the INSERT calls above.
    return { ...paidOrder, items: orderItems };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // Release runs whether we committed, rolled back, or hit an unexpected error.
    client.release();
  }
}

module.exports = { checkout };