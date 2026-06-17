// users.data.js — Data access layer for the users table.
//
// Rules of this layer:
//   - No business logic, no validation, no HTTP concepts
//   - No password hashing (the service layer hashes before calling here)
//   - Returns raw rows; undefined if no row matched
//
// password_hash is excluded from every SELECT in this file. The only place
// that ever needs it is the login query in the auth data layer.

const pool = require('../db/pool');

// Fetch a user by primary key, excluding the password hash.
// Returns the user row, or undefined if no user with that ID exists.
async function getUserById(id) {
  const result = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Update fields on a user row and return the updated row (without password_hash).
//
// `fields` is a plain object whose keys map directly to column names,
// e.g. { email: 'new@example.com' } or { password_hash: '$2b$10$...' }.
// The service layer is responsible for hashing passwords before calling here.
//
// Uses the same dynamic SET approach as updateProduct so we never accidentally
// overwrite a column that wasn't included in the request.
//
// Returns undefined if no user with that ID exists.
async function updateUser(id, fields) {
  const keys   = Object.keys(fields);
  const values = Object.values(fields);

  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const result = await pool.query(
    `UPDATE users
     SET ${setClauses}
     WHERE id = $${keys.length + 1}
     RETURNING id, username, email, created_at`,
    [...values, id]
  );
  return result.rows[0];
}

// Delete a user by primary key.
// ON DELETE CASCADE in the schema removes the user's cart and order rows automatically.
// Returns { id } of the deleted user, or undefined if no user with that ID existed.
async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
}

module.exports = { getUserById, updateUser, deleteUser };