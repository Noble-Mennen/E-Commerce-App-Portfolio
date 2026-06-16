// errorHandler.js — Centralized error handling middleware.
//
// In Express, a function with exactly 4 parameters (err, req, res, next) is
// treated as an error handler. When any route calls next(err), or when an async
// route throws an error (Express 5 catches these automatically), execution jumps
// to this function instead of the normal route handler.
//
// Centralizing error handling here means route handlers don't need to repeat
// the same res.status().json() error response logic everywhere.
//
// Usage in a route handler:
//   const err = new Error('Something went wrong');
//   err.status = 404;
//   return next(err); // jumps to this handler
//
// This must be registered in app.js after all routes (app.use(errorHandler))
// so it can catch errors from any of them.

// eslint-disable-next-line no-unused-vars — next is required by Express to identify this as an error handler
function errorHandler(err, req, res, next) {
  const status = err.status || 500;                  // default to 500 Internal Server Error
  const message = err.message || 'Internal Server Error';

  // All error responses share the same JSON shape: { error: { message: "..." } }
  // Consistent error shapes make it easier for API consumers to handle failures.
  res.status(status).json({ error: { message } });
}

module.exports = errorHandler;
