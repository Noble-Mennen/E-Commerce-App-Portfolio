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

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Array of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

// Public routes — no session required.
router.get('/',    productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wireless Headphones
 *               description:
 *                 type: string
 *                 example: Noise-cancelling over-ear headphones
 *               price:
 *                 type: number
 *                 example: 79.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (any subset of fields)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wireless Headphones Pro
 *               description:
 *                 type: string
 *                 example: Updated description
 *               price:
 *                 type: number
 *                 example: 89.99
 *               stock:
 *                 type: integer
 *                 example: 40
 *     responses:
 *       200:
 *         description: Updated product data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

// Protected routes — isAuthenticated runs first.
// If the user is not logged in, the middleware responds with 401 and the controller never runs.
router.post('/',    isAuthenticated, productsController.createProduct);
router.put('/:id',  isAuthenticated, productsController.updateProduct);
router.delete('/:id', isAuthenticated, productsController.deleteProduct);

module.exports = router;