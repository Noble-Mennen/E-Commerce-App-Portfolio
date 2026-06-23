// auth.routes.js — Routes for authentication.
//
// Router() creates a mini Express app that handles a subset of routes.
// It is mounted at /api/auth in app.js, so a route defined as '/register'
// here is actually reachable at /api/auth/register.
//
// Endpoints:
//   POST /api/auth/register — create a new user account (public)
//   POST /api/auth/login    — log in and establish a session (public)
//   POST /api/auth/logout   — destroy the session (requires login)
//   GET  /api/auth/me       — return the currently logged-in user (requires login)

const { Router } = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const authController  = require('../controllers/auth.controller');

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and establish a session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful — session cookie set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// Public — no session required.
router.post('/register', authController.register);
router.post('/login',    authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and destroy the current session
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// Protected — isAuthenticated runs first and sends 401 if the user is not logged in.
// If the check passes, it calls next() and the controller runs.
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me',      isAuthenticated, authController.me);

// Google OAuth routes — no isAuthenticated middleware because these are the
// entry points for unauthenticated users.
//
// GET /api/auth/google
//   Redirects the browser to Google's OAuth consent page.
//
// GET /api/auth/google/callback
//   Google redirects back here after the user grants or denies permission.
//   On success the session is established and the browser is sent to the frontend.
router.get('/google',          authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
