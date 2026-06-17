// users.service.js — Business logic for user account endpoints.
//
// Responsibilities:
//   1. Ownership enforcement — a user may only read or modify their own account.
//   2. Input validation — reject malformed email or weak password before the DB is touched.
//   3. Password hashing — if a new password is supplied, hash it here before passing
//      password_hash down to the data layer.
//
// Ownership check always runs before any DB call. This means a non-owner always gets
// 403 regardless of whether the target account actually exists, which avoids leaking
// the existence of other users' accounts.

const bcrypt    = require('bcrypt');
const usersData = require('../data/users.data');

const SALT_ROUNDS = 12;

// Return a user's own account (no password_hash — the data layer strips it).
async function getUserById(userId, requesterId) {
  if (requesterId !== parseInt(userId, 10)) {
    const err = new Error('You do not have permission to view this account');
    err.status = 403;
    throw err;
  }

  const user = await usersData.getUserById(userId);
  if (!user) {
    const err = new Error(`User with id ${userId} not found`);
    err.status = 404;
    throw err;
  }

  return user;
}

// Update a user's email, password, or both.
// Only fields present in the call are changed — omitted fields are left untouched.
async function updateUser(userId, requesterId, { email, password }) {
  if (requesterId !== parseInt(userId, 10)) {
    const err = new Error('You do not have permission to update this account');
    err.status = 403;
    throw err;
  }

  const fields = {};

  if (email !== undefined) {
    // Basic structural check — a real app would use a proper email library.
    if (typeof email !== 'string' || !email.trim() || !email.includes('@') || !email.includes('.')) {
      const err = new Error('A valid email address is required');
      err.status = 400;
      throw err;
    }
    fields.email = email.trim().toLowerCase();
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 8) {
      const err = new Error('Password must be at least 8 characters');
      err.status = 400;
      throw err;
    }
    // Hash before writing — the data layer never receives a plain-text password.
    fields.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (Object.keys(fields).length === 0) {
    const err = new Error('No valid fields provided for update');
    err.status = 400;
    throw err;
  }

  let user;
  try {
    user = await usersData.updateUser(userId, fields);
  } catch (dbErr) {
    // Postgres unique constraint violation — the new email is already taken.
    if (dbErr.code === '23505') {
      const conflict = new Error('An account with that email already exists');
      conflict.status = 409;
      throw conflict;
    }
    throw dbErr;
  }

  if (!user) {
    const err = new Error(`User with id ${userId} not found`);
    err.status = 404;
    throw err;
  }

  return user;
}

// Delete the user's account.
// ON DELETE CASCADE handles the user's cart and orders at the DB level.
async function deleteUser(userId, requesterId) {
  if (requesterId !== parseInt(userId, 10)) {
    const err = new Error('You do not have permission to delete this account');
    err.status = 403;
    throw err;
  }

  const deleted = await usersData.deleteUser(userId);

  if (!deleted) {
    const err = new Error(`User with id ${userId} not found`);
    err.status = 404;
    throw err;
  }
}

module.exports = { getUserById, updateUser, deleteUser };