// products.routes.js — Routes for product endpoints.
//
// Mounted at /api/products in app.js, so a route defined as '/:id'
// here is reachable at /api/products/:id.
//
// Auth design (from API_PLAN.md):
//   Reading products is public — a storefront should be browsable without an account.
//   Creating, updating, and deleting are write operations that require a login.
//
// Endpoints:
//   GET    /api/products      — list all products (public)
//   GET    /api/products/:id  — get one product (public)
//   POST   /api/products      — create a product (auth required)
//   PUT    /api/products/:id  — update a product (auth required)
//   DELETE /api/products/:id  — delete a product (auth required)

const { Router } = require('express');
const isAuthenticated      = require('../middleware/isAuthenticated');
const productsController   = require('../controllers/products.controller');

const router = Router();

// Public routes — no session required.
router.get('/',    productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

// Protected routes — isAuthenticated runs first.
// If the user is not logged in, the middleware responds with 401 and the controller never runs.
router.post('/',    isAuthenticated, productsController.createProduct);
router.put('/:id',  isAuthenticated, productsController.updateProduct);
router.delete('/:id', isAuthenticated, productsController.deleteProduct);

module.exports = router;