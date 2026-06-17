// products.data.js — Data access layer for products.
//
// This file is the only place in the app that runs SQL against the products table.
// Every function accepts the values it needs, runs one query, and returns the result.
//
// Rules of this layer:
//   - No business logic (validation, decisions about what to do with results)
//   - No HTTP concepts (no req, res, status codes)
//   - No password hashing or session logic
//   Just SQL and database results. The service layer above makes all the decisions.

const pool = require('../db/pool');

// Fetch all products, ordered newest first.
// Returns an array of product rows (may be empty if no products exist yet).
async function getAllProducts() {
  const result = await pool.query(
    'SELECT * FROM products ORDER BY created_at DESC'
  );
  return result.rows;
}

// Fetch a single product by its primary key.
// Returns the product row, or undefined if no product with that ID exists.
async function getProductById(id) {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Insert a new product row and return it.
// All four columns are required — validation is handled by the service layer before this runs.
// RETURNING * gives us the full row including the auto-generated id and created_at.
async function createProduct({ name, description, price, stock }) {
  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description ?? null, price, stock ?? 0]
  );
  return result.rows[0];
}

// Update an existing product row by ID.
//
// Why build the SET clause dynamically?
// A PUT request replaces the whole resource, but we still only want to touch
// the columns the caller actually provides. Passing undefined columns as NULL
// would wipe out existing data. Instead, we build a SET clause with only the
// fields present in the `fields` object.
//
// Example: if fields = { price: 9.99 }, the query becomes:
//   UPDATE products SET price = $1, updated_at = now() WHERE id = $2 RETURNING *
//
// Returns the updated product row, or undefined if no product with that ID exists.
async function updateProduct(id, fields) {
  // Build an array of "column = $n" fragments and a matching array of values.
  const keys   = Object.keys(fields);
  const values = Object.values(fields);

  // $1, $2, ... for each field; the ID placeholder comes after all field placeholders.
  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

  const result = await pool.query(
    `UPDATE products
     SET ${setClauses}
     WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
}

// Delete a product by ID.
// Returns the deleted product row so the service layer can confirm something was deleted,
// or undefined if no product with that ID existed.
async function deleteProduct(id) {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };