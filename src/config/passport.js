// passport.js: Passport authentication strategy configuration.
//
// Passport is an authentication middleware for Express that supports many
// strategies (local username/password, Google OAuth, etc.).
//
// This file configures two strategies:
//   1. LocalStrategy  — username and password stored in our database
//   2. GoogleStrategy — OAuth 2.0 login via Google
//
// Both strategies share the same serializeUser and deserializeUser so that
// sessions work identically regardless of how the user signed in.

const passport = require('passport');
const { Strategy: LocalStrategy }  = require('passport-local');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt   = require('bcrypt');
const authData = require('../data/auth.data');

// LocalStrategy is invoked when passport.authenticate('local') is called at login.
// Passport reads username and password from req.body by default.
//
// The done callback signals the outcome:
//   done(err)               — unexpected server error
//   done(null, false, info) — credentials invalid
//   done(null, user)        — credentials valid
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await authData.findUserByUsername(username);

    if (!user) {
      // Use the same message for both wrong username and wrong password to avoid
      // leaking which field was incorrect to an attacker.
      return done(null, false, { message: 'Invalid username or password' });
    }

    // Google-only accounts have no password_hash; block them from local login
    // so they don't see a confusing bcrypt error.
    if (!user.password_hash) {
      return done(null, false, { message: 'This account uses Google sign-in. Please use the Sign in with Google button.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// GoogleStrategy is invoked when passport.authenticate('google') is called.
// Google redirects back to GOOGLE_CALLBACK_URL with an authorization code;
// Passport exchanges it for profile data and calls this verify function.
//
// The find-or-create logic runs in three steps:
//   1. Look up by google_id — returning Google users are logged in immediately.
//   2. Look up by email — if an email match exists, link the Google ID to that
//      account so the user can sign in either way going forward.
//   3. If no match, create a new account (with an empty cart) using data from
//      the Google profile.
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Step 1: returning Google user.
      const byGoogleId = await authData.findUserByGoogleId(profile.id);
      if (byGoogleId) return done(null, byGoogleId);

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(null, false, { message: 'Google account did not provide an email address.' });
      }

      // Step 2: existing local account with the same email — link and log in.
      const byEmail = await authData.findUserByEmail(email);
      if (byEmail) {
        const linked = await authData.linkGoogleId(byEmail.id, profile.id);
        return done(null, linked);
      }

      // Step 3: new user — derive a username from the email prefix and create the account.
      // Strip characters that are not letters, digits, or underscores so the username
      // is valid, then fall back to 'user' if nothing usable remains.
      let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';

      // If the derived username is already taken, append the last four characters of the
      // Google ID to produce a unique value without requiring a retry loop.
      const taken = await authData.findUserByUsername(username);
      if (taken) {
        username = `${username}_${profile.id.slice(-4)}`;
      }

      const newUser = await authData.createGoogleUserWithCart(profile.id, username, email);
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
));

// serializeUser runs once immediately after a successful login.
// Only the user's ID is stored in the session to keep session data minimal.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser runs on every request that carries a session cookie.
// It fetches the fresh user row from the database and attaches it to req.user,
// making the logged-in user available to all route handlers on that request.
// Fetching fresh on every request means account changes take effect immediately.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await authData.findUserById(id);
    // Passing false clears the session if the account was deleted after login.
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});
