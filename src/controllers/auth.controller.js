// auth.controller.js — Request/response handling for authentication endpoints.
//
// Controllers are the HTTP layer: they read from req (body, params, session),
// call the appropriate service function, and write to res (status, JSON).
// They do NOT contain SQL queries or business logic — those belong in the layers below.
//
// Each function follows the same pattern:
//   1. Extract input from req
//   2. Call the service layer
//   3. Send a response OR forward an error to next()
//
// Express 5 automatically catches thrown errors from async functions and forwards
// them to the error handler, but we still use try/catch here to be explicit
// and to make the code easier to follow while you're learning the pattern.

const passport = require('passport');
const authService = require('../services/auth.service');

// POST /api/auth/register
// Creates a new user account and an empty cart for them.
// Returns 201 Created with the safe user object on success.
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });
    res.status(201).json({ user });
  } catch (err) {
    next(err); // forward to errorHandler.js with the status already set by the service
  }
}

// POST /api/auth/login
// Authenticates the user via Passport's LocalStrategy, then establishes a session.
//
// Why a custom callback instead of using passport.authenticate() as middleware?
// The default middleware approach sends its own error responses in a format we
// don't control. The custom callback lets us return the same consistent JSON shape
// { error: { message: "..." } } that the rest of the API uses.
//
// How the custom callback works:
//   passport.authenticate('local', callback) returns a middleware function.
//   We immediately invoke that middleware with (req, res, next).
//   Inside the callback, `user` is either the authenticated user or false.
function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    // Unexpected server error (e.g. database down) — forward to the error handler.
    if (err) return next(err);

    // Authentication failed — wrong username or password.
    // info.message is set by the LocalStrategy's done() call.
    if (!user) {
      return res.status(401).json({
        error: { message: info?.message || 'Invalid credentials' },
      });
    }

    // req.logIn() is provided by Passport. It:
    //   1. Calls serializeUser to get the ID to store in the session.
    //   2. Saves that ID to req.session.
    //   3. Sets req.user to the authenticated user for the rest of this request.
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      // Strip password_hash before responding — it should never travel over the wire.
      // Object destructuring with a rest element is a clean way to omit one field.
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser });
    });
  })(req, res, next);
}

// POST /api/auth/logout
// Destroys the session. The isAuthenticated middleware in the route file ensures
// only a logged-in user can reach this handler.
function logout(req, res, next) {
  // req.logout() is provided by Passport. It clears req.user and removes
  // the user ID from the session. The callback form is required since Passport 0.6.
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out successfully' });
  });
}

// GET /api/auth/me
// Returns the currently logged-in user. The isAuthenticated middleware guarantees
// that req.user is populated (by Passport's deserializeUser) before this runs.
// Since deserializeUser fetches user data without password_hash, req.user is already safe.
function me(req, res) {
  res.json({ user: req.user });
}

// GET /api/auth/google
// Initiates the Google OAuth flow by redirecting the browser to Google's
// consent page. The profile and email scopes request the user's display name,
// Google ID, and email address — the minimum needed to create an account.
function googleAuth(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

// GET /api/auth/google/callback
// Handles the redirect back from Google after the user grants permission.
// On success, Passport has established the session and req.user is populated,
// so we redirect the browser to the frontend. On failure (user cancelled or
// Google returned an error), we redirect to the login page.
function googleCallback(req, res, next) {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'}/login`
      );
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect(process.env.CLIENT_ORIGIN ?? 'http://localhost:5173');
    });
  })(req, res, next);
}

module.exports = { register, login, logout, me, googleAuth, googleCallback };
