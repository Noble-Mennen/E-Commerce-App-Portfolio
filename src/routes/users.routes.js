// users.routes.js — Routes for user account management.
//
// Mounted at /api/users in app.js.
// All endpoints are Self/Owner protected — a user can only read or modify their own account.
// The isAuthenticated middleware will guard these routes and req.user will identify the caller.
//
// Endpoints:
//   GET    /api/users/:id — get a user account
//   PUT    /api/users/:id — update account details (email, password, etc.)
//   DELETE /api/users/:id — delete the account

const { Router } = require('express');

const router = Router();

// GET    /api/users/:id
// PUT    /api/users/:id
// DELETE /api/users/:id

module.exports = router;
