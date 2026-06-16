// auth.data.js — Data access layer for authentication.
//
// This file contains all SQL queries related to users during the auth flow.
// It is the only place in the app that touches the users and carts tables for auth purposes.
//
// Rule of the data layer: no business logic, no password hashing, no HTTP concepts.
// Just SQL and database results. The service layer above this one makes decisions;
// this layer just executes queries.

const pool = require('../db/pool');

// Find a user by username.
// Returns the FULL user row, including password_hash — needed by the login flow
// so the service layer can compare the submitted password against the stored hash.
// Returns undefined if no user with that username exists.
async function findUserByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

// Find a user by ID.
// Intentionally excludes password_hash — this is used to restore the session on
// every authenticated request (Passport's deserializeUser), so there's no reason
// to carry the hash around on req.user.
// Returns undefined if no user with that ID exists (e.g. account was deleted).
async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Create a new user and their empty cart atomically inside a single transaction.
//
// Why a transaction? We never want a user to exist without a cart, or a cart to
// exist without an owner. If the cart INSERT fails after the user INSERT succeeds,
// a plain two-query approach would leave orphan data. A transaction guarantees
// both writes succeed together, or neither does.
//
// How pg transactions work:
//   - pool.connect() borrows a dedicated client from the pool.
//   - Using this client for all queries keeps them on the same connection,
//     which is required for BEGIN/COMMIT to cover both statements.
//   - The finally block always releases the client back to the pool,
//     even if an error is thrown.
//
// Returns the new user row WITHOUT password_hash (safe to send to the client).
// Throws the raw pg error on failure (e.g. code '23505' for unique violation) —
// the service layer interprets those into user-facing errors.
async function createUserWithCart(username, email, passwordHash) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the user and return the safe fields (no password_hash).
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );
    const user = userResult.rows[0];

    // Create the user's empty cart immediately. The UNIQUE constraint on
    // carts.user_id means a user can never accidentally end up with two carts.
    await client.query(
      'INSERT INTO carts (user_id) VALUES ($1)',
      [user.id]
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    // Roll back on any error so neither the user nor the cart is persisted.
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // Release the client back to the pool whether the transaction succeeded or failed.
    client.release();
  }
}

module.exports = { findUserByUsername, findUserById, createUserWithCart };
