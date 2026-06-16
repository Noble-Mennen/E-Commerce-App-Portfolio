// auth.routes.js — Routes for authentication.
//
// Router() creates a mini Express app that handles a subset of routes.
// It is mounted at /api/auth in app.js, so a route defined as '/'
// here is actually reachable at /api/auth/.
//
// Endpoints:
//   POST /api/auth/register — create a new user account
//   POST /api/auth/login    — log in and establish a session
//   POST /api/auth/logout   — destroy the session
//   GET  /api/auth/me       — return the currently logged-in user

const { Router } = require('express');

const router = Router();

// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// GET  /api/auth/me

module.exports = router;
