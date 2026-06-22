function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: { message: 'Not authenticated' } });
  }
  if (!req.user.is_admin) {
    return res.status(403).json({ error: { message: 'Admin access required' } });
  }
  next();
}

module.exports = isAdmin;
