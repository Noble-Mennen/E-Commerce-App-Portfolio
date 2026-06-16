function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: { message: 'Not authenticated' } });
}

module.exports = isAuthenticated;
