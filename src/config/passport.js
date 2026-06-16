// passport.js — Passport authentication configuration.
//
// Passport is an authentication middleware for Express. It supports many
// authentication strategies (local username/password, Google, GitHub, etc.).
// This file configures the LocalStrategy — username and password stored in our database.
//
// Three things must be configured:
//   1. Strategy    — how to verify a username and password
//   2. serializeUser   — what to save in the session after login (just the user ID)
//   3. deserializeUser — how to retrieve the full user from the session on each request
//
// This file contains stubs so app.js can require this file without crashing.
// The real logic is added when the login endpoint is implemented.

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

// LocalStrategy is called when passport.authenticate('local') is used on a route.
// It receives the username and password from req.body and calls done() with the result.
// done(null, false) means authentication failed. done(null, user) means it succeeded.
passport.use(new LocalStrategy(async (username, password, done) => {
  done(null, false, { message: 'Not implemented yet' });
}));

// serializeUser decides what data to store in the session after a successful login.
// We only store the user's ID — a small number — rather than the whole user object.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser runs on every authenticated request.
// It receives the ID that was saved in the session and fetches the full user from the database,
// then attaches it to req.user so route handlers can access the logged-in user.
passport.deserializeUser(async (id, done) => {
  done(null, null); // stub — not yet implemented
});
