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

// Public — no session required.
router.post('/register', authController.register);
router.post('/login',    authController.login);

// Protected — isAuthenticated runs first and sends 401 if the user is not logged in.
// If the check passes, it calls next() and the controller runs.
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me',      isAuthenticated, authController.me);

module.exports = router;
