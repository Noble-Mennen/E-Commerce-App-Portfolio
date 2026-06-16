const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

// Strategy implemented in task 8 (local login).
// Stubs are here so app.js can require('./config/passport') without crashing.

passport.use(new LocalStrategy(async (username, password, done) => {
  done(null, false, { message: 'Not implemented yet' });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  done(null, null);
});
