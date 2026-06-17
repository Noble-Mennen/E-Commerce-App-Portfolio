// cart.routes.js — Routes for cart endpoints.
// Mounted at /api/cart in app.js. All routes require authentication.
// User identity always comes from the session — no :userId in any URL.

const { Router } = require('express');

const router = Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's cart with all items
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user's cart and its items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add a product to the cart, or increment its quantity if already present
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item added or quantity incremented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/items/{productId}:
 *   put:
 *     summary: Set the quantity of an existing cart item
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Updated cart item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID of the item to remove
 *     responses:
 *       204:
 *         description: Item removed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Empty the entire cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = router;