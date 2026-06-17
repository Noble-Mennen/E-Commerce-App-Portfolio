// cart.routes.js — Routes for cart endpoints.
//
// Mounted at /api/cart in app.js. All routes are Auth level — the user
// must be logged in, but there is no ownership check beyond that because
// the cart is always the session user's cart (no :userId in any URL).
//
// Endpoints:
//   GET    /api/cart                   — view cart with items
//   POST   /api/cart/items             — add item (or increment quantity)
//   PUT    /api/cart/items/:productId  — set item quantity
//   DELETE /api/cart/items/:productId  — remove one item
//   DELETE /api/cart                   — empty the cart

const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const cartController  = require('../controllers/cart.controller');

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

router.get('/',                     isAuthenticated, cartController.getCart);
router.post('/items',               isAuthenticated, cartController.addItem);
router.put('/items/:productId',     isAuthenticated, cartController.updateItem);
router.delete('/items/:productId',  isAuthenticated, cartController.removeItem);
router.delete('/',                  isAuthenticated, cartController.clearCart);

module.exports = router;
