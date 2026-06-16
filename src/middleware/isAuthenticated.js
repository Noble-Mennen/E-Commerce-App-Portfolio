// isAuthenticated.js — Route guard middleware for protected endpoints.
//
// Middleware is a function that runs between the incoming request and the route handler.
// It receives (req, res, next) and either calls next() to continue, or sends a response
// to stop the request early.
//
// This middleware checks whether the current request has an authenticated session.
// Import it in any route that requires the user to be logged in.
//
// Usage in a route file:
//   const isAuthenticated = require('../middleware/isAuthenticated');
//   router.get('/protected', isAuthenticated, (req, res) => { ... });

function isAuthenticated(req, res, next) {
  // req.isAuthenticated() is provided by Passport.
  // It returns true if the session contains a valid logged-in user.
  if (req.isAuthenticated()) {
    return next(); // user is logged in — continue to the route handler
  }

  // User is not logged in — return 401 Unauthorized and stop the request.
  // 401 means "you need to log in". 403 would mean "you're logged in but not allowed".
  res.status(401).json({ error: { message: 'Not authenticated' } });
}

module.exports = isAuthenticated;
