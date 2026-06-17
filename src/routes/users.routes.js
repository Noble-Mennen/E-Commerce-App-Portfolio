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

// All user account routes require authentication.
// The 403 ownership check lives in the service, not here, so the route
// wiring stays clean and the auth logic stays testable without HTTP.
router.get('/:id',    isAuthenticated, usersController.getUserById);
router.put('/:id',    isAuthenticated, usersController.updateUser);
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;
