// checkout.routes.js — Route for the checkout endpoint.
// Mounted at /api/checkout in app.js. Requires authentication.

const { Router } = require('express');

const router = Router();

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Convert the current cart into a paid order
 *     description: >
 *       Runs entirely inside a single database transaction. Validates that the
 *       cart is non-empty and all items are in stock, creates an order record,
 *       snapshots item names and prices, marks the order as paid, and clears
 *       the cart. The entire operation rolls back automatically if any step fails.
 *     tags: [Checkout]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Order created and marked as paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/OrderWithItems'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = router;