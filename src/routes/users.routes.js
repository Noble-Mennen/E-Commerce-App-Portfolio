// users.routes.js — Routes for user account endpoints.
//
// Mounted at /api/users in app.js. All three routes are Self/Owner:
// the user must be logged in (isAuthenticated) AND must be acting on
// their own account (ownership enforced inside each service function).
//
// Endpoints:
//   GET    /api/users/:id  — view own account
//   PUT    /api/users/:id  — update email or password
//   DELETE /api/users/:id  — delete account

const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const usersController = require('../controllers/users.controller');

const router = Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user account (email and/or password)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Updated user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: Account deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

// All user account routes require authentication.
// The 403 ownership check lives in the service, not here, so the route
// wiring stays clean and the auth logic stays testable without HTTP.
router.get('/:id',    isAuthenticated, usersController.getUserById);
router.put('/:id',    isAuthenticated, usersController.updateUser);
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;
