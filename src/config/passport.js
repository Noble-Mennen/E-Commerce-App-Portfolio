// passport.js — Passport authentication configuration.
//
// Passport is an authentication middleware for Express. It supports many
// authentication strategies (local username/password, Google, GitHub, etc.).
// This file configures the LocalStrategy — username and password stored in our database.
//
// Three things are configured here:
//   1. Strategy        — how to verify a username and password at login
//   2. serializeUser   — what to save in the session after login (just the user ID)
//   3. deserializeUser — how to retrieve the full user from the session on each request

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const authService = require('../services/auth.service');

// LocalStrategy is invoked when passport.authenticate('local') is called (at login).
// By default, Passport reads `username` and `password` from req.body — no extra config needed.
//
// The `done` callback signals the outcome to Passport:
//   done(err)                      — unexpected server error, abort
//   done(null, false, info)        — credentials invalid, authentication failed
//   done(null, user)               — credentials valid, authentication succeeded
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // Look up the user including their password_hash so we can verify the password.
    const user = await authService.getUserByUsername(username);

    if (!user) {
      // No account found with that username.
      // We use the same message for both "wrong username" and "wrong password" on purpose —
      // telling an attacker which field was wrong makes it easier to enumerate valid usernames.
      return done(null, false, { message: 'Invalid username or password' });
    }

    // bcrypt.compare() hashes the submitted plaintext password and compares it to the
    // stored hash. It returns true if they match. We never store or compare plain text.
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    // Credentials are valid — pass the full user object to Passport.
    // Passport will hand it to serializeUser next.
    return done(null, user);
  } catch (err) {
    // Unexpected error (e.g. database is down) — forward to Express error handler.
    return done(err);
  }
}));

// serializeUser runs once, immediately after a successful login.
// It decides what to store in the session. We store only the user's ID (a small integer)
// rather than the whole user object — keeping the session data minimal.
// This ID is what deserializeUser will receive on every subsequent request.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser runs on every incoming request that has a session cookie.
// It receives the ID stored by serializeUser, fetches the fresh user from the database,
// and attaches it to req.user — making the logged-in user available to all route handlers.
//
// Fetching fresh on every request means account changes (e.g. email update) take effect
// immediately without requiring a new login.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.getUserById(id);

    // If the user was deleted after the session was created, getUserById returns undefined.
    // Passing false clears the session so subsequent requests are treated as unauthenticated.
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});
