function isAdmin(req, res, next) {
  if (req.user && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ error: { message: 'Admin access required' } });
}

module.exports = isAdmin;