// users.controller.js — Request/response handling for user account endpoints.
//
// All three routes are Self/Owner. isAuthenticated (in the route file) ensures
// the caller is logged in; the service layer checks that req.user.id matches
// the :id param and throws 403 if it doesn't.
//
// Controllers never touch password_hash — the data layer strips it from every query.

const usersService = require('../services/users.service');

// GET /api/users/:id
// Returns the user's own account. Service throws 403 for non-owners, 404 if not found.
async function getUserById(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id, req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id
// Updates email, password, or both. Returns the updated account (no password_hash).
async function updateUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await usersService.updateUser(req.params.id, req.user.id, { email, password });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id
// Deletes the account. Returns 204 No Content — there is nothing to send back.
async function deleteUser(req, res, next) {
  try {
    await usersService.deleteUser(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserById, updateUser, deleteUser };