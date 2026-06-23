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
    'SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1',
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

// Find a user by their Google account ID.
// Returns the user row without password_hash, or undefined if not found.
// Called first in the Google OAuth strategy to check for a returning Google user.
async function findUserByGoogleId(googleId) {
  const result = await pool.query(
    'SELECT id, username, email, is_admin, created_at FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0];
}

// Find a user by email address.
// Used during Google OAuth to detect when a Google account's email matches an
// existing local account so the two can be linked rather than duplicated.
async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, username, email, is_admin, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

// Create a Google-authenticated user and their empty cart in a single transaction.
// No password_hash is stored because Google handles credential verification.
// Returns the new user row without password_hash.
async function createGoogleUserWithCart(googleId, username, email) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (username, email, google_id)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, is_admin, created_at`,
      [username, email, googleId]
    );
    const user = userResult.rows[0];

    await client.query('INSERT INTO carts (user_id) VALUES ($1)', [user.id]);

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Add a Google ID to an existing local account.
// Called when a user who registered with a username and password later signs in
// with Google using the same email address. Linking prevents a duplicate account
// from being created and lets the user sign in either way going forward.
// Returns the updated user row without password_hash.
async function linkGoogleId(userId, googleId) {
  const result = await pool.query(
    `UPDATE users SET google_id = $1 WHERE id = $2
     RETURNING id, username, email, is_admin, created_at`,
    [googleId, userId]
  );
  return result.rows[0];
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUserWithCart,
  findUserByGoogleId,
  findUserByEmail,
  createGoogleUserWithCart,
  linkGoogleId,
};
