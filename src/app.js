// app.js — Express application setup.
// Builds and configures the Express app: middleware, session, auth, and routes.
// Exports the app without starting the server — server.js handles that.
//
// Middleware order matters in Express. Each app.use() call adds a layer that
// every incoming request passes through in order, top to bottom:
//   1. Body parsing   — must run first so route handlers can read req.body
//   2. Session        — must run before Passport so the session exists when Passport looks for it
//   3. Passport       — must run after session so it can read/write the user from the session
//   4. Routes         — the actual endpoint handlers
//   5. Error handler  — must be last; Express identifies it by its 4-argument signature

const express = require('express');
const session = require('express-session');
const passport = require('passport');

// Runs the passport config file (registers the LocalStrategy, serialize/deserialize).
// Must be required before any route that uses passport.authenticate().
require('./config/passport');

// Route files — each file handles one resource and exports an Express Router.
// The router is mounted at a path prefix in app.use() below.
const authRouter = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const productsRouter = require('./routes/products.routes');
const cartRouter = require('./routes/cart.routes');
const checkoutRouter = require('./routes/checkout.routes');
const ordersRouter = require('./routes/orders.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON request bodies and make them available on req.body.
// Without this, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// Session middleware — stores a session ID in a cookie on the client.
// On each request, express-session reads the cookie, looks up the session data
// on the server, and attaches it to req.session.
app.use(session({
  secret: process.env.SESSION_SECRET, // used to sign the session cookie (prevents tampering)
  resave: false,                       // don't save the session if nothing changed
  saveUninitialized: false,            // don't create a session until something is stored in it
  cookie: {
    httpOnly: true,                                    // cookie is not accessible via JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production',     // only send cookie over HTTPS in production
  },
}));

// Passport middleware — handles authentication.
// initialize() sets up passport on each request.
// session() lets passport read and write the logged-in user to/from the session.
app.use(passport.initialize());
app.use(passport.session());

// Mount route files at their URL prefixes.
// Any request to /api/auth/* is handled by authRouter, and so on.
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);

// Centralized error handler — must be registered after all routes.
// When any route calls next(err) or throws (in Express 5), execution jumps here.
app.use(errorHandler);

module.exports = app;
