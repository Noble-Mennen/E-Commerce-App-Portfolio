// auth.service.js — Business logic for authentication.
//
// The service layer sits between controllers (HTTP layer) and the data layer (SQL layer).
// It owns the "what should happen" logic: validation, password hashing, deciding which
// queries to call. It knows nothing about req, res, or HTTP status codes — that's the
// controller's job.
//
// Called by:
//   - auth.controller.js (register endpoint)
//   - config/passport.js (login strategy + session restoration)

const bcrypt = require('bcrypt');
const authData = require('../data/auth.data');

// The cost factor for bcrypt. Each increment doubles the hashing time.
// 12 is a widely used default: fast enough that users don't notice (~300ms),
// slow enough to make brute-force attacks impractical.
const SALT_ROUNDS = 12;

// Register a new user.
//
// Steps:
//   1. Validate the input fields (fail fast before touching the database).
//   2. Hash the plaintext password with bcrypt.
//   3. Persist the user + empty cart in a transaction.
//   4. Return the safe user object (no password_hash ever leaves the service layer).
//
// Throws errors with .status set so the centralized error handler can pick them up:
//   400 — missing/invalid input
//   409 — username or email already taken
async function registerUser({ username, email, password }) {
  // --- Validation ---
  // Trim the strings so " user " and "user" don't create two accounts.
  const trimmedUsername = (username || '').trim();
  const trimmedEmail    = (email    || '').trim();

  if (!trimmedUsername || !trimmedEmail || !password) {
    const err = new Error('username, email, and password are required');
    err.status = 400;
    throw err;
  }

  // Enforce a minimum password length. 8 characters is a common baseline.
  if (password.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    err.status = 400;
    throw err;
  }

  // Minimal email sanity check. A full RFC 5321-compliant check needs a library;
  // this catches obvious typos without pulling in a dependency.
  if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }

  // --- Password hashing ---
  // bcrypt.hash() generates a random salt internally and bakes it into the returned string.
  // We store only this hash — the plaintext password is never saved anywhere.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // --- Persist ---
  try {
    const user = await authData.createUserWithCart(trimmedUsername, trimmedEmail, passwordHash);
    return user;
  } catch (err) {
    // PostgreSQL error code 23505 = unique_violation.
    // This fires when username or email is already in use (both columns have UNIQUE constraints).
    // We surface a friendly 409 Conflict rather than exposing the raw db error.
    if (err.code === '23505') {
      const conflict = new Error('Username or email is already in use');
      conflict.status = 409;
      throw conflict;
    }
    throw err; // unexpected db error — let the error handler log and respond
  }
}

// Look up a user by username, including their password_hash.
// Used by the Passport LocalStrategy at login to verify credentials.
async function getUserByUsername(username) {
  return authData.findUserByUsername(username);
}

// Look up a user by ID, without password_hash.
// Used by Passport's deserializeUser to restore req.user on every authenticated request.
async function getUserById(id) {
  return authData.findUserById(id);
}

module.exports = { registerUser, getUserByUsername, getUserById };
