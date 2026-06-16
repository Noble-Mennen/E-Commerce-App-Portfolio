// products.routes.js — Routes for product catalogue management.
//
// Mounted at /api/products in app.js.
// Read endpoints (GET) are public — no login required.
// Write endpoints (POST, PUT, DELETE) require authentication.
//
// Endpoints:
//   GET    /api/products      — list all products
//   GET    /api/products/:id  — get a single product
//   POST   /api/products      — create a product (auth required)
//   PUT    /api/products/:id  — update a product (auth required)
//   DELETE /api/products/:id  — delete a product (auth required)

const { Router } = require('express');

const router = Router();

// GET    /api/products
// GET    /api/products/:id
// POST   /api/products
// PUT    /api/products/:id
// DELETE /api/products/:id

module.exports = router;
